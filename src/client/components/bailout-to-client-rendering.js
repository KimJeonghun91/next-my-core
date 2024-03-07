import { BailoutToCSRError } from '../../shared/lib/lazy-dynamic/bailout-to-csr';
import { staticGenerationAsyncStorage } from './static-generation-async-storage.external';
export function bailoutToClientRendering(reason) {
    const staticGenerationStore = staticGenerationAsyncStorage.getStore();
    if (staticGenerationStore === null || staticGenerationStore === void 0 ? void 0 : staticGenerationStore.forceStatic)
        return;
    if (staticGenerationStore === null || staticGenerationStore === void 0 ? void 0 : staticGenerationStore.isStaticGeneration)
        throw new BailoutToCSRError(reason);
}
