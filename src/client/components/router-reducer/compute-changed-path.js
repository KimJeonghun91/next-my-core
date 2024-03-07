import { INTERCEPTION_ROUTE_MARKERS } from '../../../server/future/helpers/interception-routes';
import { isGroupSegment, DEFAULT_SEGMENT_KEY, PAGE_SEGMENT_KEY, } from '../../../shared/lib/segment';
import { matchSegment } from '../match-segments';
const removeLeadingSlash = (segment) => {
    return segment[0] === '/' ? segment.slice(1) : segment;
};
const segmentToPathname = (segment) => {
    if (typeof segment === 'string') {
        return segment;
    }
    return segment[1];
};
function normalizeSegments(segments) {
    return (segments.reduce((acc, segment) => {
        segment = removeLeadingSlash(segment);
        if (segment === '' || isGroupSegment(segment)) {
            return acc;
        }
        return `${acc}/${segment}`;
    }, '') || '/');
}
export function extractPathFromFlightRouterState(flightRouterState) {
    var _a;
    const segment = Array.isArray(flightRouterState[0])
        ? flightRouterState[0][1]
        : flightRouterState[0];
    if (segment === DEFAULT_SEGMENT_KEY ||
        INTERCEPTION_ROUTE_MARKERS.some((m) => segment.startsWith(m)))
        return undefined;
    if (segment.startsWith(PAGE_SEGMENT_KEY))
        return '';
    const segments = [segment];
    const parallelRoutes = (_a = flightRouterState[1]) !== null && _a !== void 0 ? _a : {};
    const childrenPath = parallelRoutes.children
        ? extractPathFromFlightRouterState(parallelRoutes.children)
        : undefined;
    if (childrenPath !== undefined) {
        segments.push(childrenPath);
    }
    else {
        for (const [key, value] of Object.entries(parallelRoutes)) {
            if (key === 'children')
                continue;
            const childPath = extractPathFromFlightRouterState(value);
            if (childPath !== undefined) {
                segments.push(childPath);
            }
        }
    }
    return normalizeSegments(segments);
}
function computeChangedPathImpl(treeA, treeB) {
    var _a;
    const [segmentA, parallelRoutesA] = treeA;
    const [segmentB, parallelRoutesB] = treeB;
    const normalizedSegmentA = segmentToPathname(segmentA);
    const normalizedSegmentB = segmentToPathname(segmentB);
    if (INTERCEPTION_ROUTE_MARKERS.some((m) => normalizedSegmentA.startsWith(m) || normalizedSegmentB.startsWith(m))) {
        return '';
    }
    if (!matchSegment(segmentA, segmentB)) {
        // once we find where the tree changed, we compute the rest of the path by traversing the tree
        return (_a = extractPathFromFlightRouterState(treeB)) !== null && _a !== void 0 ? _a : '';
    }
    for (const parallelRouterKey in parallelRoutesA) {
        if (parallelRoutesB[parallelRouterKey]) {
            const changedPath = computeChangedPathImpl(parallelRoutesA[parallelRouterKey], parallelRoutesB[parallelRouterKey]);
            if (changedPath !== null) {
                return `${segmentToPathname(segmentB)}/${changedPath}`;
            }
        }
    }
    return null;
}
export function computeChangedPath(treeA, treeB) {
    const changedPath = computeChangedPathImpl(treeA, treeB);
    if (changedPath == null || changedPath === '/') {
        return changedPath;
    }
    // lightweight normalization to remove route groups
    return normalizeSegments(changedPath.split('/'));
}
