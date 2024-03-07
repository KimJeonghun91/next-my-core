import { createHrefFromUrl } from './create-href-from-url';
import { fillLazyItemsTillLeafWithHead } from './fill-lazy-items-till-leaf-with-head';
import { extractPathFromFlightRouterState } from './compute-changed-path';
export function createInitialRouterState({ buildId, initialTree, initialSeedData, initialCanonicalUrl, initialParallelRoutes, isServer, location, initialHead, }) {
    var _a;
    const rsc = initialSeedData[2];
    const cache = {
        lazyData: null,
        rsc: rsc,
        prefetchRsc: null,
        // The cache gets seeded during the first render. `initialParallelRoutes` ensures the cache from the first render is there during the second render.
        parallelRoutes: isServer ? new Map() : initialParallelRoutes,
    };
    // When the cache hasn't been seeded yet we fill the cache with the head.
    if (initialParallelRoutes === null || initialParallelRoutes.size === 0) {
        fillLazyItemsTillLeafWithHead(cache, undefined, initialTree, initialSeedData, initialHead);
    }
    return {
        buildId,
        tree: initialTree,
        cache,
        prefetchCache: new Map(),
        pushRef: {
            pendingPush: false,
            mpaNavigation: false,
            // First render needs to preserve the previous window.history.state
            // to avoid it being overwritten on navigation back/forward with MPA Navigation.
            preserveCustomHistoryState: true,
        },
        focusAndScrollRef: {
            apply: false,
            onlyHashChange: false,
            hashFragment: null,
            segmentPaths: [],
        },
        canonicalUrl: 
        // location.href is read as the initial value for canonicalUrl in the browser
        // This is safe to do as canonicalUrl can't be rendered, it's only used to control the history updates in the useEffect further down in this file.
        location
            ? // window.location does not have the same type as URL but has all the fields createHrefFromUrl needs.
                createHrefFromUrl(location)
            : initialCanonicalUrl,
        nextUrl: 
        // the || operator is intentional, the pathname can be an empty string
        (_a = (extractPathFromFlightRouterState(initialTree) || (location === null || location === void 0 ? void 0 : location.pathname))) !== null && _a !== void 0 ? _a : null,
    };
}
