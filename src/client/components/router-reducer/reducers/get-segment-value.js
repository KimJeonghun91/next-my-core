export function getSegmentValue(segment) {
    return Array.isArray(segment) ? segment[1] : segment;
}
