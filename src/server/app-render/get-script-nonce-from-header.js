import { ESCAPE_REGEX } from '../htmlescape';
export function getScriptNonceFromHeader(cspHeaderValue) {
    var _a;
    const directives = cspHeaderValue
        // Directives are split by ';'.
        .split(';')
        .map((directive) => directive.trim());
    // First try to find the directive for the 'script-src', otherwise try to
    // fallback to the 'default-src'.
    const directive = directives.find((dir) => dir.startsWith('script-src')) ||
        directives.find((dir) => dir.startsWith('default-src'));
    // If no directive could be found, then we're done.
    if (!directive) {
        return;
    }
    // Extract the nonce from the directive
    const nonce = (_a = directive
        .split(' ')
        // Remove the 'strict-src'/'default-src' string, this can't be the nonce.
        .slice(1)
        .map((source) => source.trim())
        // Find the first source with the 'nonce-' prefix.
        .find((source) => source.startsWith("'nonce-") &&
        source.length > 8 &&
        source.endsWith("'"))) === null || _a === void 0 ? void 0 : _a.slice(7, -1);
    // If we could't find the nonce, then we're done.
    if (!nonce) {
        return;
    }
    // Don't accept the nonce value if it contains HTML escape characters.
    // Technically, the spec requires a base64'd value, but this is just an
    // extra layer.
    if (ESCAPE_REGEX.test(nonce)) {
        throw new Error('Nonce value from Content-Security-Policy contained HTML escape characters.\nLearn more: https://nextjs.org/docs/messages/nonce-contained-invalid-characters');
    }
    return nonce;
}
