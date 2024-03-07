var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
import { isDynamicRoute } from '../../../shared/lib/router/utils';
import { getSortedRoutes } from '../../../shared/lib/router/utils';
import { LocaleRouteMatcher } from '../route-matchers/locale-route-matcher';
import { ensureLeadingSlash } from '../../../shared/lib/page-path/ensure-leading-slash';
import { DetachedPromise } from '../../../lib/detached-promise';
export class DefaultRouteMatcherManager {
    constructor() {
        this.providers = [];
        this.matchers = {
            static: [],
            dynamic: [],
            duplicates: {},
        };
        this.lastCompilationID = this.compilationID;
        this.previousMatchers = [];
    }
    /**
     * When this value changes, it indicates that a change has been introduced
     * that requires recompilation.
     */
    get compilationID() {
        return this.providers.length;
    }
    async waitTillReady() {
        if (this.waitTillReadyPromise) {
            await this.waitTillReadyPromise;
            delete this.waitTillReadyPromise;
        }
    }
    async reload() {
        var _a, _b;
        const { promise, resolve, reject } = new DetachedPromise();
        this.waitTillReadyPromise = promise;
        // Grab the compilation ID for this run, we'll verify it at the end to
        // ensure that if any routes were added before reloading is finished that
        // we error out.
        const compilationID = this.compilationID;
        try {
            // Collect all the matchers from each provider.
            const matchers = [];
            // Get all the providers matchers.
            const providersMatchers = await Promise.all(this.providers.map((provider) => provider.matchers()));
            // Use this to detect duplicate pathnames.
            const all = new Map();
            const duplicates = {};
            for (const providerMatchers of providersMatchers) {
                for (const matcher of providerMatchers) {
                    // Reset duplicated matches when reloading from pages conflicting state.
                    if (matcher.duplicated)
                        delete matcher.duplicated;
                    // Test to see if the matcher being added is a duplicate.
                    const duplicate = all.get(matcher.definition.pathname);
                    if (duplicate) {
                        // This looks a little weird, but essentially if the pathname
                        // already exists in the duplicates map, then we got that array
                        // reference. Otherwise, we create a new array with the original
                        // duplicate first. Then we push the new matcher into the duplicate
                        // array, and reset it to the duplicates object (which may be a
                        // no-op if the pathname already existed in the duplicates object).
                        // Then we set the array of duplicates on both the original
                        // duplicate object and the new one, so we can keep them in sync.
                        // If a new duplicate is found, and it matches an existing pathname,
                        // the retrieval of the `other` will actually return the array
                        // reference used by all other duplicates. This is why ReadonlyArray
                        // is so important! Array's are always references!
                        const others = (_a = duplicates[matcher.definition.pathname]) !== null && _a !== void 0 ? _a : [
                            duplicate,
                        ];
                        others.push(matcher);
                        duplicates[matcher.definition.pathname] = others;
                        // Add duplicated details to each route.
                        duplicate.duplicated = others;
                        matcher.duplicated = others;
                        // TODO: see if we should error for duplicates in production?
                    }
                    matchers.push(matcher);
                    // Add the matcher's pathname to the set.
                    all.set(matcher.definition.pathname, matcher);
                }
            }
            // Update the duplicate matchers. This is used in the development manager
            // to warn about duplicates.
            this.matchers.duplicates = duplicates;
            // If the cache is the same as what we just parsed, we can exit now. We
            // can tell by using the `===` which compares object identity, which for
            // the manifest matchers, will return the same matcher each time.
            if (this.previousMatchers.length === matchers.length &&
                this.previousMatchers.every((cachedMatcher, index) => cachedMatcher === matchers[index])) {
                return;
            }
            this.previousMatchers = matchers;
            // For matchers that are for static routes, filter them now.
            this.matchers.static = matchers.filter((matcher) => !matcher.isDynamic);
            // For matchers that are for dynamic routes, filter them and sort them now.
            const dynamic = matchers.filter((matcher) => matcher.isDynamic);
            // As `getSortedRoutes` only takes an array of strings, we need to create
            // a map of the pathnames (used for sorting) and the matchers. When we
            // have locales, there may be multiple matches for the same pathname. To
            // handle this, we keep a map of all the indexes (in `reference`) and
            // merge them in later.
            const reference = new Map();
            const pathnames = new Array();
            for (let index = 0; index < dynamic.length; index++) {
                // Grab the pathname from the definition.
                const pathname = dynamic[index].definition.pathname;
                // Grab the index in the dynamic array, push it into the reference.
                const indexes = (_b = reference.get(pathname)) !== null && _b !== void 0 ? _b : [];
                indexes.push(index);
                // If this is the first one set it. If it isn't, we don't need to
                // because pushing above on the array will mutate the array already
                // stored there because array's are always a reference!
                if (indexes.length === 1)
                    reference.set(pathname, indexes);
                // Otherwise, continue, we've already added this pathname before.
                else
                    continue;
                pathnames.push(pathname);
            }
            // Sort the array of pathnames.
            const sorted = getSortedRoutes(pathnames);
            // For each of the sorted pathnames, iterate over them, grabbing the list
            // of indexes and merging them back into the new `sortedDynamicMatchers`
            // array. The order of the same matching pathname doesn't matter because
            // they will have other matching characteristics (like the locale) that
            // is considered.
            const sortedDynamicMatchers = [];
            for (const pathname of sorted) {
                const indexes = reference.get(pathname);
                if (!Array.isArray(indexes)) {
                    throw new Error('Invariant: expected to find identity in indexes map');
                }
                const dynamicMatches = indexes.map((index) => dynamic[index]);
                sortedDynamicMatchers.push(...dynamicMatches);
            }
            this.matchers.dynamic = sortedDynamicMatchers;
            // This means that there was a new matcher pushed while we were waiting
            if (this.compilationID !== compilationID) {
                throw new Error('Invariant: expected compilation to finish before new matchers were added, possible missing await');
            }
        }
        catch (err) {
            reject(err);
        }
        finally {
            // The compilation ID matched, so mark the complication as finished.
            this.lastCompilationID = compilationID;
            resolve();
        }
    }
    push(provider) {
        this.providers.push(provider);
    }
    async test(pathname, options) {
        // See if there's a match for the pathname...
        const match = await this.match(pathname, options);
        // This default implementation only needs to check to see if there _was_ a
        // match. The development matcher actually changes it's behavior by not
        // recompiling the routes.
        return match !== null;
    }
    async match(pathname, options) {
        var _a, e_1, _b, _c;
        try {
            // "Iterate" over the match options. Once we found a single match, exit with
            // it, otherwise return null below. If no match is found, the inner block
            // won't be called.
            for (var _d = true, _e = __asyncValues(this.matchAll(pathname, options)), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const match = _c;
                return match;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    /**
     * This is a point for other managers to override to inject other checking
     * behavior like duplicate route checking on a per-request basis.
     *
     * @param pathname the pathname to validate against
     * @param matcher the matcher to validate/test with
     * @returns the match if found
     */
    validate(pathname, matcher, options) {
        var _a;
        if (matcher instanceof LocaleRouteMatcher) {
            return matcher.match(pathname, options);
        }
        // If the locale was inferred from the default locale, then it will have
        // already added a locale to the pathname. We need to remove it before
        // matching because this matcher is not locale aware.
        if ((_a = options.i18n) === null || _a === void 0 ? void 0 : _a.inferredFromDefault) {
            return matcher.match(options.i18n.pathname);
        }
        return matcher.match(pathname);
    }
    matchAll(pathname, options) {
        return __asyncGenerator(this, arguments, function* matchAll_1() {
            // Guard against the matcher manager from being run before it needs to be
            // recompiled. This was preferred to re-running the compilation here because
            // it should be re-ran only when it changes. If a match is attempted before
            // this is done, it indicates that there is a case where a provider is added
            // before it was recompiled (an error). We also don't want to affect request
            // times.
            if (this.lastCompilationID !== this.compilationID) {
                throw new Error('Invariant: expected routes to have been loaded before match');
            }
            // Ensure that path matching is done with a leading slash.
            pathname = ensureLeadingSlash(pathname);
            // If this pathname doesn't look like a dynamic route, and this pathname is
            // listed in the normalized list of routes, then return it. This ensures
            // that when a route like `/user/[id]` is encountered, it doesn't just match
            // with the list of normalized routes.
            if (!isDynamicRoute(pathname)) {
                for (const matcher of this.matchers.static) {
                    const match = this.validate(pathname, matcher, options);
                    if (!match)
                        continue;
                    yield yield __await(match);
                }
            }
            // If we should skip handling dynamic routes, exit now.
            if (options === null || options === void 0 ? void 0 : options.skipDynamic)
                return yield __await(null
                // Loop over the dynamic matchers, yielding each match.
                );
            // Loop over the dynamic matchers, yielding each match.
            for (const matcher of this.matchers.dynamic) {
                const match = this.validate(pathname, matcher, options);
                if (!match)
                    continue;
                yield yield __await(match);
            }
            // We tried direct matching against the pathname and against all the dynamic
            // paths, so there was no match.
            return yield __await(null);
        });
    }
}
