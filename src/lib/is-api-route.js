export function isAPIRoute(value) {
    return value === '/api' || Boolean(value === null || value === void 0 ? void 0 : value.startsWith('/api/'));
}
