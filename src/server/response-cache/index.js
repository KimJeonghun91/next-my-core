import { RouteKind } from '../future/route-kind';
import { Batcher } from '../../lib/batcher';
import { scheduleOnNextTick } from '../../lib/scheduler';
import { fromResponseCacheEntry, toResponseCacheEntry } from './utils';
export * from './types';
export default class ResponseCache {
    constructor(minimalMode) {
        this.batcher = Batcher.create({
            // Ensure on-demand revalidate doesn't block normal requests, it should be
            // safe to run an on-demand revalidate for the same key as a normal request.
            cacheKeyFn: ({ key, isOnDemandRevalidate }) => `${key}-${isOnDemandRevalidate ? '1' : '0'}`,
            // We wait to do any async work until after we've added our promise to
            // `pendingResponses` to ensure that any any other calls will reuse the
            // same promise until we've fully finished our work.
            schedulerFn: scheduleOnNextTick,
        });
        // this is a hack to avoid Webpack knowing this is equal to this.minimalMode
        // because we replace this.minimalMode to true in production bundles.
        const minimalModeKey = 'minimalMode';
        this[minimalModeKey] = minimalMode;
    }
    async get(key, responseGenerator, context) {
        // If there is no key for the cache, we can't possibly look this up in the
        // cache so just return the result of the response generator.
        if (!key)
            return responseGenerator(false, null);
        const { incrementalCache, isOnDemandRevalidate = false } = context;
        const response = await this.batcher.batch({ key, isOnDemandRevalidate }, async (cacheKey, resolve) => {
            var _a, _b;
            // We keep the previous cache entry around to leverage when the
            // incremental cache is disabled in minimal mode.
            if (this.minimalMode &&
                ((_a = this.previousCacheItem) === null || _a === void 0 ? void 0 : _a.key) === cacheKey &&
                this.previousCacheItem.expiresAt > Date.now()) {
                return this.previousCacheItem.entry;
            }
            // Coerce the kindHint into a given kind for the incremental cache.
            let kindHint;
            if (context.routeKind === RouteKind.APP_PAGE ||
                context.routeKind === RouteKind.APP_ROUTE) {
                kindHint = 'app';
            }
            else if (context.routeKind === RouteKind.PAGES) {
                kindHint = 'pages';
            }
            let resolved = false;
            let cachedResponse = null;
            try {
                cachedResponse = !this.minimalMode
                    ? await incrementalCache.get(key, { kindHint })
                    : null;
                if (cachedResponse && !isOnDemandRevalidate) {
                    if (((_b = cachedResponse.value) === null || _b === void 0 ? void 0 : _b.kind) === 'FETCH') {
                        throw new Error(`invariant: unexpected cachedResponse of kind fetch in response cache`);
                    }
                    resolve(Object.assign(Object.assign({}, cachedResponse), { revalidate: cachedResponse.curRevalidate }));
                    resolved = true;
                    if (!cachedResponse.isStale || context.isPrefetch) {
                        // The cached value is still valid, so we don't need
                        // to update it yet.
                        return null;
                    }
                }
                const cacheEntry = await responseGenerator(resolved, cachedResponse, true);
                // If the cache entry couldn't be generated, we don't want to cache
                // the result.
                if (!cacheEntry) {
                    // Unset the previous cache item if it was set.
                    if (this.minimalMode)
                        this.previousCacheItem = undefined;
                    return null;
                }
                const resolveValue = await fromResponseCacheEntry(Object.assign(Object.assign({}, cacheEntry), { isMiss: !cachedResponse }));
                if (!resolveValue) {
                    // Unset the previous cache item if it was set.
                    if (this.minimalMode)
                        this.previousCacheItem = undefined;
                    return null;
                }
                // For on-demand revalidate wait to resolve until cache is set.
                // Otherwise resolve now.
                if (!isOnDemandRevalidate && !resolved) {
                    resolve(resolveValue);
                    resolved = true;
                }
                if (typeof resolveValue.revalidate !== 'undefined') {
                    if (this.minimalMode) {
                        this.previousCacheItem = {
                            key: cacheKey,
                            entry: resolveValue,
                            expiresAt: Date.now() + 1000,
                        };
                    }
                    else {
                        await incrementalCache.set(key, resolveValue.value, {
                            revalidate: resolveValue.revalidate,
                        });
                    }
                }
                return resolveValue;
            }
            catch (err) {
                // When a getStaticProps path is erroring we automatically re-set the
                // existing cache under a new expiration to prevent non-stop retrying.
                if (cachedResponse) {
                    await incrementalCache.set(key, cachedResponse.value, {
                        revalidate: Math.min(Math.max(cachedResponse.revalidate || 3, 3), 30),
                    });
                }
                // While revalidating in the background we can't reject as we already
                // resolved the cache entry so log the error here.
                if (resolved) {
                    console.error(err);
                    return null;
                }
                // We haven't resolved yet, so let's throw to indicate an error.
                throw err;
            }
        });
        return toResponseCacheEntry(response);
    }
}
