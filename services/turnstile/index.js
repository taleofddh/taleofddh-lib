// @taleofddh/turnstile
//
// Wraps the Cloudflare Turnstile `siteverify` endpoint. This package only
// *verifies* a token the browser already obtained from Cloudflare; it never
// issues tokens, and it does not own secret provisioning.
//
// SECRET HANDLING: the Cloudflare secret is passed in by the caller as an
// argument. The consumer (API layer) is responsible for resolving it from AWS
// Secrets Manager (e.g. via @taleofddh/secret) and injecting the value here.
// This package never reads the secret from the environment, never logs it, and
// never returns it.
//
// FAIL CLOSED is deliberate: on any network error, timeout, non-2xx HTTP
// status, or JSON parse failure we return `{ ok:false }` so the consumer
// rejects when verification cannot be completed. A consumer may choose to
// fail open via its own enforcement flag, but this package defaults closed.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const DEFAULT_TIMEOUT_MS = 5000;

const timeoutMs = () => {
    const raw = Number(process.env.TURNSTILE_TIMEOUT_MS);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS;
};

/**
 * Verify a Cloudflare Turnstile token.
 *
 * @param {string} token - the Turnstile response token from the browser.
 * @param {string} secret - the Cloudflare Turnstile secret, resolved and
 *   injected by the caller (e.g. from AWS Secrets Manager). Never read from env.
 * @param {string} [remoteIp] - the caller's source IP (optional).
 * @returns {Promise<{ok: boolean, errorCodes: string[], hostname?: string, challengeTs?: string}>}
 */
export const verify = async (token, secret, remoteIp) => {
    // Missing/empty token: no network call.
    if (typeof token !== "string" || token.length === 0) {
        const result = { ok: false, errorCodes: ["missing-input-response"] };
        logFailure(result.errorCodes);
        return result;
    }

    // Missing secret: the caller failed to inject it. Surface misconfiguration
    // instead of silently passing.
    if (typeof secret !== "string" || secret.length === 0) {
        console.error(
            JSON.stringify({
                event: "turnstile_config_error",
                message: "Turnstile secret was not provided by the caller",
            })
        );
        const result = { ok: false, errorCodes: ["missing-input-secret"] };
        logFailure(result.errorCodes);
        return result;
    }

    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    // Only include remoteip when it is a non-empty string.
    if (typeof remoteIp === "string" && remoteIp.length > 0) {
        body.set("remoteip", remoteIp);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs());

    try {
        const response = await fetch(SITEVERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
            signal: controller.signal,
        });

        if (!response.ok) {
            // Non-2xx HTTP status -> fail closed.
            const result = { ok: false, errorCodes: ["verification-unavailable"] };
            logFailure(result.errorCodes, response.status);
            return result;
        }

        const data = await response.json();

        if (data && data.success === true) {
            return {
                ok: true,
                errorCodes: [],
                hostname: data.hostname,
                challengeTs: data["challenge_ts"],
            };
        }

        // Cloudflare returned success:false -> pass through their error codes.
        const errorCodes = Array.isArray(data?.["error-codes"]) ? data["error-codes"] : [];
        logFailure(errorCodes);
        return { ok: false, errorCodes };
    } catch (err) {
        // Network error, timeout (abort), or JSON parse failure -> fail closed.
        const result = { ok: false, errorCodes: ["verification-unavailable"] };
        logFailure(result.errorCodes, undefined, err?.name);
        return result;
    } finally {
        clearTimeout(timer);
    }
};

// Explicitly named alias.
export const verifyTurnstileToken = verify;

// Structured, secret/token-free failure logging so bot volume is observable.
const logFailure = (errorCodes, status, errorName) => {
    const payload = { event: "turnstile_verify_failed", errorCodes };
    if (status !== undefined) payload.status = status;
    if (errorName !== undefined) payload.error = errorName;
    console.warn(JSON.stringify(payload));
};
