export function wrapNormalizerFn(fn) {
    return { normalize: fn };
}
