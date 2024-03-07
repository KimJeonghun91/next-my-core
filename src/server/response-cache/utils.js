import RenderResult from '../render-result';
export async function fromResponseCacheEntry(cacheEntry) {
    var _a;
    return Object.assign(Object.assign({}, cacheEntry), { value: ((_a = cacheEntry.value) === null || _a === void 0 ? void 0 : _a.kind) === 'PAGE'
            ? {
                kind: 'PAGE',
                html: await cacheEntry.value.html.toUnchunkedString(true),
                postponed: cacheEntry.value.postponed,
                pageData: cacheEntry.value.pageData,
                headers: cacheEntry.value.headers,
                status: cacheEntry.value.status,
            }
            : cacheEntry.value });
}
export async function toResponseCacheEntry(response) {
    var _a, _b;
    if (!response)
        return null;
    if (((_a = response.value) === null || _a === void 0 ? void 0 : _a.kind) === 'FETCH') {
        throw new Error('Invariant: unexpected cachedResponse of kind fetch in response cache');
    }
    return {
        isMiss: response.isMiss,
        isStale: response.isStale,
        revalidate: response.revalidate,
        value: ((_b = response.value) === null || _b === void 0 ? void 0 : _b.kind) === 'PAGE'
            ? {
                kind: 'PAGE',
                html: RenderResult.fromStatic(response.value.html),
                pageData: response.value.pageData,
                postponed: response.value.postponed,
                headers: response.value.headers,
                status: response.value.status,
            }
            : response.value,
    };
}
