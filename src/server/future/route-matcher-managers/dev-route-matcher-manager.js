var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
import { RouteKind } from '../route-kind';
import { DefaultRouteMatcherManager } from './default-route-matcher-manager';
import path from '../../../shared/lib/isomorphic/path';
import * as Log from '../../../build/output/log';
import { cyan } from '../../../lib/picocolors';
export class DevRouteMatcherManager extends DefaultRouteMatcherManager {
    constructor(production, ensurer, dir) {
        super();
        this.production = production;
        this.ensurer = ensurer;
        this.dir = dir;
    }
    async test(pathname, options) {
        // Try to find a match within the developer routes.
        const match = await _super.match.call(this, pathname, options);
        // Return if the match wasn't null. Unlike the implementation of `match`
        // which uses `matchAll` here, this does not call `ensure` on the match
        // found via the development matches.
        return match !== null;
    }
    validate(pathname, matcher, options) {
        const match = super.validate(pathname, matcher, options);
        // If a match was found, check to see if there were any conflicting app or
        // pages files.
        // TODO: maybe expand this to _any_ duplicated routes instead?
        if (match &&
            matcher.duplicated &&
            matcher.duplicated.some((duplicate) => duplicate.definition.kind === RouteKind.APP_PAGE ||
                duplicate.definition.kind === RouteKind.APP_ROUTE) &&
            matcher.duplicated.some((duplicate) => duplicate.definition.kind === RouteKind.PAGES ||
                duplicate.definition.kind === RouteKind.PAGES_API)) {
            return null;
        }
        return match;
    }
    matchAll(pathname, options) {
        const _super = Object.create(null, {
            reload: { get: () => super.reload },
            matchAll: { get: () => super.matchAll }
        });
        return __asyncGenerator(this, arguments, function* matchAll_1() {
            var _a, e_1, _b, _c, _d, e_2, _e, _f;
            // Compile the development routes.
            // TODO: we may want to only run this during testing, users won't be fast enough to require this many dir scans
            yield __await(_super.reload.call(this)
            // Iterate over the development matches to see if one of them match the
            // request path.
            );
            try {
                // Iterate over the development matches to see if one of them match the
                // request path.
                for (var _g = true, _h = __asyncValues(_super.matchAll.call(this, pathname, options)), _j; _j = yield __await(_h.next()), _a = _j.done, !_a; _g = true) {
                    _c = _j.value;
                    _g = false;
                    const development = _c;
                    // We're here, which means that we haven't seen this match yet, so we
                    // should try to ensure it and recompile the production matcher.
                    yield __await(this.ensurer.ensure(development, pathname));
                    yield __await(this.production.reload()
                    // Iterate over the production matches again, this time we should be able
                    // to match it against the production matcher unless there's an error.
                    );
                    try {
                        // Iterate over the production matches again, this time we should be able
                        // to match it against the production matcher unless there's an error.
                        for (var _k = true, _l = (e_2 = void 0, __asyncValues(this.production.matchAll(pathname, options))), _m; _m = yield __await(_l.next()), _d = _m.done, !_d; _k = true) {
                            _f = _m.value;
                            _k = false;
                            const production = _f;
                            yield yield __await(production);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_k && !_d && (_e = _l.return)) yield __await(_e.call(_l));
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = _h.return)) yield __await(_b.call(_h));
                }
                finally { if (e_1) throw e_1.error; }
            }
            // We tried direct matching against the pathname and against all the dynamic
            // paths, so there was no match.
            return yield __await(null);
        });
    }
    async reload() {
        // Compile the production routes again.
        await this.production.reload();
        // Compile the development routes.
        await _super.reload.call(this);
        // Check for and warn of any duplicates.
        for (const [pathname, matchers] of Object.entries(this.matchers.duplicates)) {
            // We only want to warn about matchers resolving to the same path if their
            // identities are different.
            const identity = matchers[0].identity;
            if (matchers.slice(1).some((matcher) => matcher.identity !== identity)) {
                continue;
            }
            Log.warn(`Duplicate page detected. ${matchers
                .map((matcher) => cyan(path.relative(this.dir, matcher.definition.filename)))
                .join(' and ')} resolve to ${cyan(pathname)}`);
        }
    }
}
