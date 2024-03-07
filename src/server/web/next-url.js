import { detectDomainLocale } from '../../shared/lib/i18n/detect-domain-locale';
import { formatNextPathnameInfo } from '../../shared/lib/router/utils/format-next-pathname-info';
import { getHostname } from '../../shared/lib/get-hostname';
import { getNextPathnameInfo } from '../../shared/lib/router/utils/get-next-pathname-info';
const REGEX_LOCALHOST_HOSTNAME = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
function parseURL(url, base) {
    return new URL(String(url).replace(REGEX_LOCALHOST_HOSTNAME, 'localhost'), base && String(base).replace(REGEX_LOCALHOST_HOSTNAME, 'localhost'));
}
const Internal = Symbol('NextURLInternal');
export class NextURL {
    constructor(input, baseOrOpts, opts) {
        let base;
        let options;
        if ((typeof baseOrOpts === 'object' && 'pathname' in baseOrOpts) ||
            typeof baseOrOpts === 'string') {
            base = baseOrOpts;
            options = opts || {};
        }
        else {
            options = opts || baseOrOpts || {};
        }
        this[Internal] = {
            url: parseURL(input, base !== null && base !== void 0 ? base : options.base),
            options: options,
            basePath: '',
        };
        this.analyze();
    }
    analyze() {
        var _a, _b, _c, _d, _e, _f, _g;
        const info = getNextPathnameInfo(this[Internal].url.pathname, {
            nextConfig: this[Internal].options.nextConfig,
            parseData: !process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE,
            i18nProvider: this[Internal].options.i18nProvider,
        });
        const hostname = getHostname(this[Internal].url, this[Internal].options.headers);
        this[Internal].domainLocale = this[Internal].options.i18nProvider
            ? this[Internal].options.i18nProvider.detectDomainLocale(hostname)
            : detectDomainLocale((_b = (_a = this[Internal].options.nextConfig) === null || _a === void 0 ? void 0 : _a.i18n) === null || _b === void 0 ? void 0 : _b.domains, hostname);
        const defaultLocale = ((_c = this[Internal].domainLocale) === null || _c === void 0 ? void 0 : _c.defaultLocale) ||
            ((_e = (_d = this[Internal].options.nextConfig) === null || _d === void 0 ? void 0 : _d.i18n) === null || _e === void 0 ? void 0 : _e.defaultLocale);
        this[Internal].url.pathname = info.pathname;
        this[Internal].defaultLocale = defaultLocale;
        this[Internal].basePath = (_f = info.basePath) !== null && _f !== void 0 ? _f : '';
        this[Internal].buildId = info.buildId;
        this[Internal].locale = (_g = info.locale) !== null && _g !== void 0 ? _g : defaultLocale;
        this[Internal].trailingSlash = info.trailingSlash;
    }
    formatPathname() {
        return formatNextPathnameInfo({
            basePath: this[Internal].basePath,
            buildId: this[Internal].buildId,
            defaultLocale: !this[Internal].options.forceLocale
                ? this[Internal].defaultLocale
                : undefined,
            locale: this[Internal].locale,
            pathname: this[Internal].url.pathname,
            trailingSlash: this[Internal].trailingSlash,
        });
    }
    formatSearch() {
        return this[Internal].url.search;
    }
    get buildId() {
        return this[Internal].buildId;
    }
    set buildId(buildId) {
        this[Internal].buildId = buildId;
    }
    get locale() {
        var _a;
        return (_a = this[Internal].locale) !== null && _a !== void 0 ? _a : '';
    }
    set locale(locale) {
        var _a, _b;
        if (!this[Internal].locale ||
            !((_b = (_a = this[Internal].options.nextConfig) === null || _a === void 0 ? void 0 : _a.i18n) === null || _b === void 0 ? void 0 : _b.locales.includes(locale))) {
            throw new TypeError(`The NextURL configuration includes no locale "${locale}"`);
        }
        this[Internal].locale = locale;
    }
    get defaultLocale() {
        return this[Internal].defaultLocale;
    }
    get domainLocale() {
        return this[Internal].domainLocale;
    }
    get searchParams() {
        return this[Internal].url.searchParams;
    }
    get host() {
        return this[Internal].url.host;
    }
    set host(value) {
        this[Internal].url.host = value;
    }
    get hostname() {
        return this[Internal].url.hostname;
    }
    set hostname(value) {
        this[Internal].url.hostname = value;
    }
    get port() {
        return this[Internal].url.port;
    }
    set port(value) {
        this[Internal].url.port = value;
    }
    get protocol() {
        return this[Internal].url.protocol;
    }
    set protocol(value) {
        this[Internal].url.protocol = value;
    }
    get href() {
        const pathname = this.formatPathname();
        const search = this.formatSearch();
        return `${this.protocol}//${this.host}${pathname}${search}${this.hash}`;
    }
    set href(url) {
        this[Internal].url = parseURL(url);
        this.analyze();
    }
    get origin() {
        return this[Internal].url.origin;
    }
    get pathname() {
        return this[Internal].url.pathname;
    }
    set pathname(value) {
        this[Internal].url.pathname = value;
    }
    get hash() {
        return this[Internal].url.hash;
    }
    set hash(value) {
        this[Internal].url.hash = value;
    }
    get search() {
        return this[Internal].url.search;
    }
    set search(value) {
        this[Internal].url.search = value;
    }
    get password() {
        return this[Internal].url.password;
    }
    set password(value) {
        this[Internal].url.password = value;
    }
    get username() {
        return this[Internal].url.username;
    }
    set username(value) {
        this[Internal].url.username = value;
    }
    get basePath() {
        return this[Internal].basePath;
    }
    set basePath(value) {
        this[Internal].basePath = value.startsWith('/') ? value : `/${value}`;
    }
    toString() {
        return this.href;
    }
    toJSON() {
        return this.href;
    }
    [Symbol.for('edge-runtime.inspect.custom')]() {
        return {
            href: this.href,
            origin: this.origin,
            protocol: this.protocol,
            username: this.username,
            password: this.password,
            host: this.host,
            hostname: this.hostname,
            port: this.port,
            pathname: this.pathname,
            search: this.search,
            searchParams: this.searchParams,
            hash: this.hash,
        };
    }
    clone() {
        return new NextURL(String(this), this[Internal].options);
    }
}
