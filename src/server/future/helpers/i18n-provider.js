/**
 * The I18NProvider is used to match locale aware routes, detect the locale from
 * the pathname and hostname and normalize the pathname by removing the locale
 * prefix.
 */
export class I18NProvider {
    constructor(config) {
        var _a;
        this.config = config;
        if (!config.locales.length) {
            throw new Error('Invariant: No locales provided');
        }
        this.lowerCaseLocales = config.locales.map((locale) => locale.toLowerCase());
        this.lowerCaseDomains = (_a = config.domains) === null || _a === void 0 ? void 0 : _a.map((domainLocale) => {
            var _a;
            const domain = domainLocale.domain.toLowerCase();
            return {
                defaultLocale: domainLocale.defaultLocale.toLowerCase(),
                hostname: domain.split(':', 1)[0],
                domain,
                locales: (_a = domainLocale.locales) === null || _a === void 0 ? void 0 : _a.map((locale) => locale.toLowerCase()),
                http: domainLocale.http,
            };
        });
    }
    /**
     * Detects the domain locale from the hostname and the detected locale if
     * provided.
     *
     * @param hostname The hostname to detect the domain locale from, this must be lowercased.
     * @param detectedLocale The detected locale to use if the hostname does not match.
     * @returns The domain locale if found, `undefined` otherwise.
     */
    detectDomainLocale(hostname, detectedLocale) {
        var _a;
        if (!hostname || !this.lowerCaseDomains || !this.config.domains)
            return;
        if (detectedLocale)
            detectedLocale = detectedLocale.toLowerCase();
        for (let i = 0; i < this.lowerCaseDomains.length; i++) {
            const domainLocale = this.lowerCaseDomains[i];
            if (
            // We assume that the hostname is already lowercased.
            domainLocale.hostname === hostname ||
                (
                // Configuration validation ensures that the locale is not repeated in
                // other domains locales.
                (_a = domainLocale.locales) === null || _a === void 0 ? void 0 : _a.some((locale) => locale === detectedLocale))) {
                return this.config.domains[i];
            }
        }
        return;
    }
    /**
     * Pulls the pre-computed locale and inference results from the query
     * object.
     *
     * @param pathname the pathname that could contain a locale prefix
     * @param query the query object
     * @returns the locale analysis result
     */
    fromQuery(pathname, query) {
        const detectedLocale = query.__nextLocale;
        // If a locale was detected on the query, analyze the pathname to ensure
        // that the locale matches.
        if (detectedLocale) {
            const analysis = this.analyze(pathname);
            // If the analysis contained a locale we should validate it against the
            // query and strip it from the pathname.
            if (analysis.detectedLocale) {
                if (analysis.detectedLocale !== detectedLocale) {
                    throw new Error(`Invariant: The detected locale does not match the locale in the query. Expected to find '${detectedLocale}' in '${pathname}' but found '${analysis.detectedLocale}'}`);
                }
                pathname = analysis.pathname;
            }
        }
        return {
            pathname,
            detectedLocale,
            inferredFromDefault: query.__nextInferredLocaleFromDefault === '1',
        };
    }
    /**
     * Analyzes the pathname for a locale and returns the pathname without it.
     *
     * @param pathname The pathname that could contain a locale prefix.
     * @param options The options to use when matching the locale.
     * @returns The matched locale and the pathname without the locale prefix
     *          (if any).
     */
    analyze(pathname, options = {}) {
        let detectedLocale = options.defaultLocale;
        // By default, we assume that the default locale was inferred if there was
        // no detected locale.
        let inferredFromDefault = typeof detectedLocale === 'string';
        // The first segment will be empty, because it has a leading `/`. If
        // there is no further segment, there is no locale (or it's the default).
        const segments = pathname.split('/', 2);
        if (!segments[1])
            return {
                detectedLocale,
                pathname,
                inferredFromDefault,
            };
        // The second segment will contain the locale part if any.
        const segment = segments[1].toLowerCase();
        // See if the segment matches one of the locales. If it doesn't, there is
        // no locale (or it's the default).
        const index = this.lowerCaseLocales.indexOf(segment);
        if (index < 0)
            return {
                detectedLocale,
                pathname,
                inferredFromDefault,
            };
        // Return the case-sensitive locale.
        detectedLocale = this.config.locales[index];
        inferredFromDefault = false;
        // Remove the `/${locale}` part of the pathname.
        pathname = pathname.slice(detectedLocale.length + 1) || '/';
        return {
            detectedLocale,
            pathname,
            inferredFromDefault,
        };
    }
}
