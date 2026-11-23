/**
 * Privacy scan utilities for public text.
 * Masks or rejects private details: email addresses, phone numbers, UK postcodes,
 * booking references and names from a deny list.
 *
 * No AWS access. No dependencies. No logging.
 */

/** The string that replaces every matched private detail. */
export const MASK = '[removed]';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+/gi;

// UK postcode, e.g. SW1A 1AA, M1 1AE, DT5 1DD.
const POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi;

// A run of digits (with optional +, spaces, dots, dashes, brackets) holding at least 9 digits.
const PHONE = /(?<![\w])\+?\(?\d[\d\s().-]{7,}\d(?![\w])/g;

// Booking references: a keyword followed by a code that contains a digit.
// e.g. "Booking ref: AB12CD", "reservation number X7Y8Z9Q", "PNR 6H4K2P".
// The lookbehind keeps the keyword in the output; only the reference code is replaced.
const BOOKING = /(?<=\b(?:booking|reservation|confirmation|itinerary|pnr|order|ticket)(?:\s+(?:ref(?:erence)?|number|no\.?|id|code))?\s*[:#-]?\s*)(?=[A-Z0-9]*\d)[A-Z0-9]{5,10}\b/gi;

const digits = (text) => (text.match(/\d/g) || []).length;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cleanNames = (names) =>
    [...new Set(names.map((name) => String(name).trim()).filter((name) => name.length >= 2))];

/**
 * Parses the deny list secret. One object holds a list per stage:
 * `{"dev": ["Name One"], "prod": ["Name One"]}`.
 * A stage's value may be an array or a single string of names separated by commas or new lines.
 *
 * Throws when the value is not JSON, is not an object keyed by stage, or has no entry for the
 * requested stage — so a misconfigured secret is never silently read as "no names".
 *
 * @param {string} raw   Raw secret string (JSON).
 * @param {string} stage Deployment stage, e.g. `'dev'` or `'prod'`.
 * @returns {string[]}   Trimmed, deduplicated names (minimum 2 characters each).
 */
export const parseDenyList = (raw, stage) => {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('Deny list secret is not JSON');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Deny list secret must be an object keyed by stage');
    }
    const entry = parsed[stage];
    if (Array.isArray(entry)) return cleanNames(entry);
    if (typeof entry === 'string') return cleanNames(entry.split(/[\n,]/));
    throw new Error('Deny list secret has no list for this stage');
};

const denyPattern = (denyList) => {
    const names = (denyList || []).filter((name) => typeof name === 'string' && name.trim().length >= 2);
    if (names.length === 0) return null;
    // Longest first so "Anna Maria" wins over "Anna".
    names.sort((a, b) => b.length - a.length);
    return new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${names.map((name) => escapeRegExp(name.trim())).join('|')})(?![\\p{L}\\p{N}])`,
        'giu'
    );
};

const rules = (denyList) =>
    [
        { type: 'email', pattern: EMAIL },
        { type: 'booking reference', pattern: BOOKING },
        { type: 'postcode', pattern: POSTCODE },
        { type: 'phone number', pattern: PHONE, accept: (match) => digits(match) >= 9 },
        { type: 'name on deny list', pattern: denyPattern(denyList) },
    ].filter((rule) => rule.pattern);

/**
 * Scans one text value. Returns `{ text, matches }` where `text` has every match replaced by
 * `MASK` and `matches` lists the kind of each match (one entry per match found).
 * Non-string or empty input is returned unchanged with no matches.
 *
 * @param {*}        value     The text to scan.
 * @param {string[]} denyList  Names to treat as private (from `parseDenyList`).
 * @returns {{ text: *, matches: string[] }}
 */
export const scanText = (value, denyList = []) => {
    if (typeof value !== 'string' || value.length === 0) return { text: value, matches: [] };
    let text = value;
    const matches = [];
    for (const { type, pattern, accept } of rules(denyList)) {
        text = text.replace(new RegExp(pattern.source, pattern.flags), (match) => {
            if (accept && !accept(match)) return match;
            matches.push(type);
            return MASK;
        });
    }
    return { text, matches };
};

/**
 * Scans each field of an object. Returns `{ values, warnings }`:
 * - `values`   — masked text per field.
 * - `warnings` — `{ field, type }` entries, one per field and kind (no duplicates within a field).
 *
 * @param {Record<string, *>} fields
 * @param {string[]}          denyList
 * @returns {{ values: Record<string, *>, warnings: Array<{ field: string, type: string }> }}
 */
export const scanFields = (fields, denyList = []) => {
    const values = {};
    const warnings = [];
    for (const [field, value] of Object.entries(fields || {})) {
        const { text, matches } = scanText(value, denyList);
        values[field] = text;
        for (const type of new Set(matches)) warnings.push({ field, type });
    }
    return { values, warnings };
};

/**
 * Save-path check: returns one error message per field and kind that contains private details.
 * Message format: `"<field> must not contain private details (<type>)"`.
 *
 * @param {Record<string, *>} fields
 * @param {string[]}          denyList
 * @returns {string[]}
 */
export const privacyErrors = (fields, denyList = []) => {
    const { warnings } = scanFields(fields, denyList);
    return warnings.map(({ field, type }) => `${field} must not contain private details (${type})`);
};
