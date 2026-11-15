/**
 * Generic permission check for API Gateway Lambda handlers.
 *
 * The API Gateway Cognito user pool authorizer verifies the JWT before the
 * request reaches the handler, so the claims in
 * `event.requestContext.authorizer.claims` are trusted. Identity and roles are
 * read ONLY from those claims, never from the request body or headers.
 *
 * This module contains no role names and no permission names:
 *   - Roles are Cognito user pool groups (`cognito:groups` claim).
 *   - Role -> permissions is business data in a DynamoDB table whose name comes
 *     from the `ROLE_PERMISSIONS_TABLE` environment variable. Each item is
 *     `{ role: string, permissions: string[] | Set<string> }`; the permission
 *     `*` grants every permission.
 *   - Permission names are supplied by the feature code that checks them.
 *
 * Environment variables:
 *   - ROLE_PERMISSIONS_TABLE (required for requirePermission): table name
 *   - ROLE_PERMISSIONS_CACHE_TTL_SECONDS (optional, default 300): cache lifetime
 *   - REGION (optional, default eu-west-1): DynamoDB region
 *
 * The thrown `UnauthorizedError` (401) and `ForbiddenError` (403) carry the
 * `name` and `statusCode` that `@taleofddh/error` maps to 401 and 403. If the
 * table can't be read (missing configuration or any DynamoDB error), access is
 * denied with `PermissionsUnavailableError`, which the error helper maps to 500.
 */

const WILDCARD = '*';
const DEFAULT_CACHE_TTL_SECONDS = 300;

class AuthError extends Error {
  constructor(name, statusCode, message, details = null) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized', details = null) {
    super('UnauthorizedError', 401, message, details);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'Forbidden', details = null) {
    super('ForbiddenError', 403, message, details);
  }
}

/**
 * Parse the `cognito:groups` claim into a list of group names.
 * API Gateway may deliver it as an array, `"a,b"`, `"[a b]"`, or omit it.
 *
 * @param {*} raw - raw value of the `cognito:groups` claim
 * @returns {string[]} group names (empty when the claim is absent)
 */
export function parseGroups(raw) {
  if (Array.isArray(raw)) {
    return raw.map((g) => String(g).trim()).filter((g) => g.length > 0);
  }
  if (typeof raw !== 'string') {
    return [];
  }
  let value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    value = value.slice(1, -1);
  }
  return value
    .split(/[\s,]+/)
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
}

/**
 * Extract the caller's identity and groups from verified authorizer claims.
 *
 * @param {Object} event - API Gateway Lambda proxy event
 * @returns {{ sub: string|undefined, email: string|undefined, groups: string[] }}
 * @throws {UnauthorizedError} (401) when there is no signed-in caller
 */
export function getCaller(event) {
  const claims = event?.requestContext?.authorizer?.claims;
  if (!claims || typeof claims !== 'object' || !claims.sub) {
    throw new UnauthorizedError('Missing authorizer claims');
  }
  return {
    sub: claims.sub,
    email: claims.email,
    groups: parseGroups(claims['cognito:groups'])
  };
}

function toPermissionList(value) {
  if (Array.isArray(value) || value instanceof Set) {
    return [...value].filter((p) => typeof p === 'string' && p.length > 0);
  }
  return [];
}

/**
 * Build a permission checker around a role-permissions loader. Used by the
 * default `requirePermission`; also useful to plug in a different data source.
 *
 * @param {Object} options
 * @param {() => Promise<Map<string, string[]>>} options.loadRolePermissions -
 *   returns a map of role name -> permissions
 * @param {number} [options.cacheTtlMs] - cache lifetime in ms (default 5 minutes)
 * @param {() => number} [options.now] - clock, defaults to Date.now
 * @returns {{ requirePermission: Function, clearCache: Function }}
 */
export function createPermissionChecker({
  loadRolePermissions,
  cacheTtlMs = DEFAULT_CACHE_TTL_SECONDS * 1000,
  now = Date.now
}) {
  if (typeof loadRolePermissions !== 'function') {
    throw new TypeError('loadRolePermissions must be a function');
  }

  let cache = null; // { rolePermissions: Map, expiresAt: number }
  let inFlight = null;

  async function getRolePermissions() {
    const ttl = typeof cacheTtlMs === 'function' ? cacheTtlMs() : cacheTtlMs;
    if (cache && now() < cache.expiresAt) {
      return cache.rolePermissions;
    }
    if (!inFlight) {
      inFlight = (async () => {
        try {
          const rolePermissions = await loadRolePermissions();
          cache = { rolePermissions, expiresAt: now() + ttl };
          return rolePermissions;
        } catch (cause) {
          // Deny with 500 whatever the underlying error. DynamoDB errors such as
          // AccessDeniedException or ThrottlingException would otherwise map to
          // 403 / 503 in the error helper.
          const error = new Error('Role permissions are unavailable', { cause });
          error.name = 'PermissionsUnavailableError';
          error.statusCode = 500;
          throw error;
        } finally {
          inFlight = null;
        }
      })();
    }
    return inFlight;
  }

  /**
   * Allow the request if any of the caller's groups grants `permission` or `*`.
   *
   * @param {Object} event - API Gateway Lambda proxy event
   * @param {string} permission - permission name defined by the feature code
   * @returns {Promise<{ sub, email, groups }>} the caller
   * @throws {UnauthorizedError} (401) when there is no signed-in caller
   * @throws {ForbiddenError} (403) when no group grants the permission
   */
  async function requirePermission(event, permission) {
    if (typeof permission !== 'string' || permission.length === 0) {
      throw new TypeError('permission must be a non-empty string');
    }
    const caller = getCaller(event);
    if (caller.groups.length > 0) {
      const rolePermissions = await getRolePermissions();
      // Groups not in the table (e.g. Cognito's automatic *_Google groups) are ignored.
      const allowed = caller.groups.some((group) => {
        const granted = rolePermissions.get(group);
        return granted !== undefined && (granted.includes(permission) || granted.includes(WILDCARD));
      });
      if (allowed) {
        return caller;
      }
    }
    throw new ForbiddenError('Insufficient permissions', { permission });
  }

  function clearCache() {
    cache = null;
  }

  return { requirePermission, clearCache };
}

let docClient = null;

async function getDocClient() {
  if (!docClient) {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: process.env['REGION'] || 'eu-west-1' })
    );
  }
  return docClient;
}

/**
 * Read the whole role-permissions table named by ROLE_PERMISSIONS_TABLE.
 * @returns {Promise<Map<string, string[]>>}
 */
export async function loadRolePermissionsFromTable() {
  const tableName = process.env['ROLE_PERMISSIONS_TABLE'];
  if (!tableName) {
    const error = new Error('ROLE_PERMISSIONS_TABLE environment variable is not set');
    error.name = 'ConfigurationError';
    throw error;
  }
  const client = await getDocClient();
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const rolePermissions = new Map();
  let ExclusiveStartKey;
  do {
    const result = await client.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey }));
    for (const item of result.Items || []) {
      if (typeof item.role === 'string' && item.role.length > 0) {
        rolePermissions.set(item.role, toPermissionList(item.permissions));
      }
    }
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return rolePermissions;
}

function cacheTtlFromEnv() {
  const seconds = Number(process.env['ROLE_PERMISSIONS_CACHE_TTL_SECONDS']);
  return (Number.isFinite(seconds) && seconds >= 0 ? seconds : DEFAULT_CACHE_TTL_SECONDS) * 1000;
}

const defaultChecker = createPermissionChecker({
  loadRolePermissions: loadRolePermissionsFromTable,
  cacheTtlMs: cacheTtlFromEnv
});

/**
 * Check that the signed-in caller may perform `permission`, using the
 * role-permissions table named by ROLE_PERMISSIONS_TABLE (cached, default 5 minutes).
 *
 * @param {Object} event - API Gateway Lambda proxy event
 * @param {string} permission - permission name defined by the feature code
 * @returns {Promise<{ sub, email, groups }>} the caller
 */
export const requirePermission = (event, permission) => defaultChecker.requirePermission(event, permission);

/** Drop the cached role-permissions table so the next check reloads it. */
export const clearPermissionsCache = () => defaultChecker.clearCache();

export default {
  getCaller,
  requirePermission,
  clearPermissionsCache,
  createPermissionChecker,
  loadRolePermissionsFromTable,
  parseGroups,
  UnauthorizedError,
  ForbiddenError
};
