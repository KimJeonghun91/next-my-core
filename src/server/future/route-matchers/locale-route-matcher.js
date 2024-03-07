import { RouteMatcher } from './route-matcher';
export class LocaleRouteMatcher extends RouteMatcher {
    /**
     * Identity returns the identity part of the matcher. This is used to compare
     * a unique matcher to another. This is also used when sorting dynamic routes,
     * so it must contain the pathname part as well.
     */
    get identity() {
        var _a;
        return `${this.definition.pathname}?__nextLocale=${(_a = this.definition.i18n) === null || _a === void 0 ? void 0 : _a.locale}`;
    }
    /**
     * Match will attempt to match the given pathname against this route while
     * also taking into account the locale information.
     *
     * @param pathname The pathname to match against.
     * @param options The options to use when matching.
     * @returns The match result, or `null` if there was no match.
     */
    match(pathname, options) {
        var _a, _b, _c;
        // This is like the parent `match` method but instead this injects the
        // additional `options` into the
        const result = this.test(pathname, options);
        if (!result)
            return null;
        return {
            definition: this.definition,
            params: result.params,
            detectedLocale: 
            // If the options have a detected locale, then use that, otherwise use
            // the route's locale.
            (_b = (_a = options === null || options === void 0 ? void 0 : options.i18n) === null || _a === void 0 ? void 0 : _a.detectedLocale) !== null && _b !== void 0 ? _b : (_c = this.definition.i18n) === null || _c === void 0 ? void 0 : _c.locale,
        };
    }
    /**
     * Test will attempt to match the given pathname against this route while
     * also taking into account the locale information.
     *
     * @param pathname The pathname to match against.
     * @param options The options to use when matching.
     * @returns The match result, or `null` if there was no match.
     */
    test(pathname, options) {
        // If this route has locale information and we have detected a locale, then
        // we need to compare the detected locale to the route's locale.
        if (this.definition.i18n && (options === null || options === void 0 ? void 0 : options.i18n)) {
            // If we have detected a locale and it does not match this route's locale,
            // then this isn't a match!
            if (this.definition.i18n.locale &&
                options.i18n.detectedLocale &&
                this.definition.i18n.locale !== options.i18n.detectedLocale) {
                return null;
            }
            // Perform regular matching against the locale stripped pathname now, the
            // locale information matches!
            return super.test(options.i18n.pathname);
        }
        // If we don't have locale information, then we can just perform regular
        // matching.
        return super.test(pathname);
    }
}
