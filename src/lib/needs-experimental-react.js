export function needsExperimentalReact(config) {
    var _a, _b;
    return Boolean(((_a = config.experimental) === null || _a === void 0 ? void 0 : _a.ppr) || ((_b = config.experimental) === null || _b === void 0 ? void 0 : _b.taint));
}
