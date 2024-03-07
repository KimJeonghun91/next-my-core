export const ACTION_REFRESH = 'refresh';
export const ACTION_NAVIGATE = 'navigate';
export const ACTION_RESTORE = 'restore';
export const ACTION_SERVER_PATCH = 'server-patch';
export const ACTION_PREFETCH = 'prefetch';
export const ACTION_FAST_REFRESH = 'fast-refresh';
export const ACTION_SERVER_ACTION = 'server-action';
/**
 * PrefetchKind defines the type of prefetching that should be done.
 * - `auto` - if the page is dynamic, prefetch the page data partially, if static prefetch the page data fully.
 * - `full` - prefetch the page data fully.
 * - `temporary` - a temporary prefetch entry is added to the cache, this is used when prefetch={false} is used in next/link or when you push a route programmatically.
 */
export var PrefetchKind;
(function (PrefetchKind) {
    PrefetchKind["AUTO"] = "auto";
    PrefetchKind["FULL"] = "full";
    PrefetchKind["TEMPORARY"] = "temporary";
})(PrefetchKind || (PrefetchKind = {}));
export function isThenable(value) {
    // TODO: We don't gain anything from this abstraction. It's unsound, and only
    // makes sense in the specific places where we use it. So it's better to keep
    // the type coercion inline, instead of leaking this to other places in
    // the codebase.
    return (value &&
        (typeof value === 'object' || typeof value === 'function') &&
        typeof value.then === 'function');
}
