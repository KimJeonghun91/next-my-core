import { staticGenerationBailout } from '../../../client/components/static-generation-bailout';
export function revalidateTag(tag) {
    var _a, _b, _c, _d;
    const staticGenerationAsyncStorage = (_b = (_a = fetch).__nextGetStaticStore) === null || _b === void 0 ? void 0 : _b.call(_a);
    const store = staticGenerationAsyncStorage === null || staticGenerationAsyncStorage === void 0 ? void 0 : staticGenerationAsyncStorage.getStore();
    if (!store || !store.incrementalCache) {
        throw new Error(`Invariant: static generation store missing in revalidateTag ${tag}`);
    }
    // a route that makes use of revalidation APIs should be considered dynamic
    // as otherwise it would be impossible to revalidate
    staticGenerationBailout(`revalidateTag ${tag}`);
    if (!store.revalidatedTags) {
        store.revalidatedTags = [];
    }
    if (!store.revalidatedTags.includes(tag)) {
        store.revalidatedTags.push(tag);
    }
    if (!store.pendingRevalidates) {
        store.pendingRevalidates = {};
    }
    store.pendingRevalidates[tag] = (_d = (_c = store.incrementalCache).revalidateTag) === null || _d === void 0 ? void 0 : _d.call(_c, tag).catch((err) => {
        console.error(`revalidateTag failed for ${tag}`, err);
    });
    // TODO: only revalidate if the path matches
    store.pathWasRevalidated = true;
}
