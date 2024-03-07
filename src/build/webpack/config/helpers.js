import curry from 'next/dist/compiled/lodash.curry';
export const loader = curry(function loader(rule, config) {
    var _a, _b;
    if (!config.module) {
        config.module = { rules: [] };
    }
    if (rule.oneOf) {
        const existing = (_a = config.module.rules) === null || _a === void 0 ? void 0 : _a.find((arrayRule) => arrayRule && typeof arrayRule === 'object' && arrayRule.oneOf);
        if (existing && typeof existing === 'object') {
            existing.oneOf.push(...rule.oneOf);
            return config;
        }
    }
    (_b = config.module.rules) === null || _b === void 0 ? void 0 : _b.push(rule);
    return config;
});
export const unshiftLoader = curry(function unshiftLoader(rule, config) {
    var _a, _b, _c;
    if (!config.module) {
        config.module = { rules: [] };
    }
    if (rule.oneOf) {
        const existing = (_a = config.module.rules) === null || _a === void 0 ? void 0 : _a.find((arrayRule) => arrayRule && typeof arrayRule === 'object' && arrayRule.oneOf);
        if (existing && typeof existing === 'object') {
            (_b = existing.oneOf) === null || _b === void 0 ? void 0 : _b.unshift(...rule.oneOf);
            return config;
        }
    }
    (_c = config.module.rules) === null || _c === void 0 ? void 0 : _c.unshift(rule);
    return config;
});
export const plugin = curry(function plugin(p, config) {
    if (!config.plugins) {
        config.plugins = [];
    }
    config.plugins.push(p);
    return config;
});
