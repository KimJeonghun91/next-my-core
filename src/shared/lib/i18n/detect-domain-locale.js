export function detectDomainLocale(domainItems, hostname, detectedLocale) {
    var _a, _b;
    if (!domainItems)
        return;
    if (detectedLocale) {
        detectedLocale = detectedLocale.toLowerCase();
    }
    for (const item of domainItems) {
        // remove port if present
        const domainHostname = (_a = item.domain) === null || _a === void 0 ? void 0 : _a.split(':', 1)[0].toLowerCase();
        if (hostname === domainHostname ||
            detectedLocale === item.defaultLocale.toLowerCase() ||
            ((_b = item.locales) === null || _b === void 0 ? void 0 : _b.some((locale) => locale.toLowerCase() === detectedLocale))) {
            return item;
        }
    }
}
