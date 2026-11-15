/**
 * Cognito group-based authorization helper for API Gateway Lambda handlers.
 *
 * The API Gateway Cognito user pool authorizer verifies the JWT before the
 * request reaches the handler, so the claims in
 * `event.requestContext.authorizer.claims` are trusted. This module reads
 * caller identity and business roles ONLY from those claims — never from the
 * request body or headers — and enforces roles consistently across admin
 * endpoints via `requireGroup`.
 *
 * The thrown `UnauthorizedError` (401) and `ForbiddenError` (403) carry the
 * same `name` and `statusCode` the existing `@taleofddh/error` ErrorHandler
 * dispatches on, so they map to the correct HTTP status when handled there.
 */

/**
 * Cognito user pool group names (business roles).
 * `admin` implies every manager role.
 */
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  GALLERY_MANAGER: 'gallery-manager',
  BLOG_MANAGER: 'blog-manager'
});

/**
 * Base class for authorization errors. Carries an HTTP `statusCode` and a
 * `name` that the existing error helper switches on.
 */
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
 * Parse the `cognito:groups` claim into a trimmed list of group names.
 *
 * API Gateway may deliver the claim as:
 *   - an array: `['admin', 'blog-manager']`
 *   - a comma-separated string: `'admin,blog-manager'`
 *   - a bracketed, space-separated string: `'[admin blog-manager]'`
 *   - missing entirely
 *
 * @param {*} raw - raw value of the `cognito:groups` claim
 * @returns {string[]} group names (empty when the claim is absent)
 */
export function parseGroups(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((g) => (typeof g === 'string' ? g.trim() : String(g).trim()))
      .filter((g) => g.length > 0);
  }

  if (typeof raw !== 'string') {
    return [];
  }

  let value = raw.trim();

  // Strip a single pair of surrounding brackets, e.g. "[a b]" -> "a b"
  if (value.startsWith('[') && value.endsWith(']')) {
    value = value.slice(1, -1).trim();
  }

  if (value.length === 0) {
    return [];
  }

  // Treat commas and whitespace as equivalent separators ("a,b" or "a b")
  return value
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Extract the caller's identity and roles from verified authorizer claims.
 *
 * Reads ONLY from `event.requestContext.authorizer.claims`. Identity or roles
 * present in the request body or headers are never consulted.
 *
 * @param {Object} event - API Gateway Lambda proxy event
 * @returns {{ sub: string|undefined, email: string|undefined, groups: string[] }}
 * @throws {UnauthorizedError} (401) when authorizer claims are missing
 */
export function getCaller(event) {
  const claims = event?.requestContext?.authorizer?.claims;

  if (!claims || typeof claims !== 'object') {
    throw new UnauthorizedError('Missing authorizer claims');
  }

  return {
    sub: claims.sub,
    email: claims.email,
    groups: parseGroups(claims['cognito:groups'])
  };
}

/**
 * Require the caller to hold one of the given business roles (or be `admin`).
 *
 * `admin` implies every manager role, so an admin always passes. Authentication
 * is checked first: a request without authorizer claims throws
 * `UnauthorizedError` (401) before any role is evaluated.
 *
 * @param {Object} event - API Gateway Lambda proxy event
 * @param {...string} groups - one or more `ROLES` that are permitted
 * @returns {{ sub: string|undefined, email: string|undefined, groups: string[] }} the caller
 * @throws {UnauthorizedError} (401) when authorizer claims are missing
 * @throws {ForbiddenError} (403) when the caller holds none of the required roles
 */
export function requireGroup(event, ...groups) {
  const caller = getCaller(event);

  // `admin` implies every manager role.
  if (caller.groups.includes(ROLES.ADMIN)) {
    return caller;
  }

  const requested = groups.map((g) => String(g));

  if (requested.length > 0 && requested.some((g) => caller.groups.includes(g))) {
    return caller;
  }

  throw new ForbiddenError(
    'Insufficient permissions: required role not granted',
    { required: requested, groups: caller.groups }
  );
}

export default {
  ROLES,
  getCaller,
  requireGroup,
  parseGroups,
  UnauthorizedError,
  ForbiddenError
};
