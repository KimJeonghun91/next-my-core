const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;
export var PrefetchCacheEntryStatus;
(function (PrefetchCacheEntryStatus) {
    PrefetchCacheEntryStatus["fresh"] = "fresh";
    PrefetchCacheEntryStatus["reusable"] = "reusable";
    PrefetchCacheEntryStatus["expired"] = "expired";
    PrefetchCacheEntryStatus["stale"] = "stale";
})(PrefetchCacheEntryStatus || (PrefetchCacheEntryStatus = {}));
export function getPrefetchEntryCacheStatus({ kind, prefetchTime, lastUsedTime, }) {
    // if the cache entry was prefetched or read less than 30s ago, then we want to re-use it
    if (Date.now() < (lastUsedTime !== null && lastUsedTime !== void 0 ? lastUsedTime : prefetchTime) + THIRTY_SECONDS) {
        return lastUsedTime
            ? PrefetchCacheEntryStatus.reusable
            : PrefetchCacheEntryStatus.fresh;
    }
    // if the cache entry was prefetched less than 5 mins ago, then we want to re-use only the loading state
    if (kind === 'auto') {
        if (Date.now() < prefetchTime + FIVE_MINUTES) {
            return PrefetchCacheEntryStatus.stale;
        }
    }
    // if the cache entry was prefetched less than 5 mins ago and was a "full" prefetch, then we want to re-use it "full
    if (kind === 'full') {
        if (Date.now() < prefetchTime + FIVE_MINUTES) {
            return PrefetchCacheEntryStatus.reusable;
        }
    }
    return PrefetchCacheEntryStatus.expired;
}
