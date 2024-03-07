import { computeChangedPath } from './compute-changed-path';
function isNotUndefined(value) {
    return typeof value !== 'undefined';
}
export function handleMutable(state, mutable) {
    var _a, _b, _c;
    // shouldScroll is true by default, can override to false.
    const shouldScroll = (_a = mutable.shouldScroll) !== null && _a !== void 0 ? _a : true;
    let nextUrl = state.nextUrl;
    if (isNotUndefined(mutable.patchedTree)) {
        // If we received a patched tree, we need to compute the changed path.
        const changedPath = computeChangedPath(state.tree, mutable.patchedTree);
        if (changedPath) {
            // If the tree changed, we need to update the nextUrl
            nextUrl = changedPath;
        }
        else if (!nextUrl) {
            // if the tree ends up being the same (ie, no changed path), and we don't have a nextUrl, then we should use the canonicalUrl
            nextUrl = state.canonicalUrl;
        }
        // otherwise this will be a no-op and continue to use the existing nextUrl
    }
    return {
        buildId: state.buildId,
        // Set href.
        canonicalUrl: isNotUndefined(mutable.canonicalUrl)
            ? mutable.canonicalUrl === state.canonicalUrl
                ? state.canonicalUrl
                : mutable.canonicalUrl
            : state.canonicalUrl,
        pushRef: {
            pendingPush: isNotUndefined(mutable.pendingPush)
                ? mutable.pendingPush
                : state.pushRef.pendingPush,
            mpaNavigation: isNotUndefined(mutable.mpaNavigation)
                ? mutable.mpaNavigation
                : state.pushRef.mpaNavigation,
            preserveCustomHistoryState: isNotUndefined(mutable.preserveCustomHistoryState)
                ? mutable.preserveCustomHistoryState
                : state.pushRef.preserveCustomHistoryState,
        },
        // All navigation requires scroll and focus management to trigger.
        focusAndScrollRef: {
            apply: shouldScroll
                ? isNotUndefined(mutable === null || mutable === void 0 ? void 0 : mutable.scrollableSegments)
                    ? true
                    : state.focusAndScrollRef.apply
                : // If shouldScroll is false then we should not apply scroll and focus management.
                    false,
            onlyHashChange: !!mutable.hashFragment &&
                state.canonicalUrl.split('#', 1)[0] ===
                    ((_b = mutable.canonicalUrl) === null || _b === void 0 ? void 0 : _b.split('#', 1)[0]),
            hashFragment: shouldScroll
                ? // Empty hash should trigger default behavior of scrolling layout into view.
                    // #top is handled in layout-router.
                    mutable.hashFragment && mutable.hashFragment !== ''
                        ? // Remove leading # and decode hash to make non-latin hashes work.
                            decodeURIComponent(mutable.hashFragment.slice(1))
                        : state.focusAndScrollRef.hashFragment
                : // If shouldScroll is false then we should not apply scroll and focus management.
                    null,
            segmentPaths: shouldScroll
                ? (_c = mutable === null || mutable === void 0 ? void 0 : mutable.scrollableSegments) !== null && _c !== void 0 ? _c : state.focusAndScrollRef.segmentPaths
                : // If shouldScroll is false then we should not apply scroll and focus management.
                    [],
        },
        // Apply cache.
        cache: mutable.cache ? mutable.cache : state.cache,
        prefetchCache: mutable.prefetchCache
            ? mutable.prefetchCache
            : state.prefetchCache,
        // Apply patched router state.
        tree: isNotUndefined(mutable.patchedTree)
            ? mutable.patchedTree
            : state.tree,
        nextUrl,
    };
}
