var _a;
import '../../server/web/globals';
import { adapter } from '../../server/web/adapter';
import { getRender } from '../webpack/loaders/next-edge-ssr-loader/render';
import { IncrementalCache } from '../../server/lib/incremental-cache';
import { renderToHTMLOrFlight as renderToHTML } from '../../server/app-render/app-render';
import * as pageMod from 'VAR_USERLAND';
import { PAGE_TYPES } from '../../lib/page-types';
import { setReferenceManifestsSingleton } from '../../server/app-render/action-encryption-utils';
import { createServerModuleMap } from '../../server/app-render/action-utils';
// OPTIONAL_IMPORT:incrementalCacheHandler
const Document = null;
const appMod = null;
const errorMod = null;
const error500Mod = null;
// INJECT:sriEnabled
// INJECT:isServerComponent
// INJECT:dev
// INJECT:serverActions
// INJECT:nextConfig
const maybeJSONParse = (str) => (str ? JSON.parse(str) : undefined);
const buildManifest = self.__BUILD_MANIFEST;
const prerenderManifest = maybeJSONParse(self.__PRERENDER_MANIFEST);
const reactLoadableManifest = maybeJSONParse(self.__REACT_LOADABLE_MANIFEST);
const rscManifest = (_a = self.__RSC_MANIFEST) === null || _a === void 0 ? void 0 : _a['VAR_PAGE'];
const rscServerManifest = maybeJSONParse(self.__RSC_SERVER_MANIFEST);
const subresourceIntegrityManifest = sriEnabled
    ? maybeJSONParse(self.__SUBRESOURCE_INTEGRITY_MANIFEST)
    : undefined;
const nextFontManifest = maybeJSONParse(self.__NEXT_FONT_MANIFEST);
if (rscManifest && rscServerManifest) {
    setReferenceManifestsSingleton({
        clientReferenceManifest: rscManifest,
        serverActionsManifest: rscServerManifest,
        serverModuleMap: createServerModuleMap({
            serverActionsManifest: rscServerManifest,
            pageName: 'VAR_PAGE',
        }),
    });
}
const render = getRender({
    pagesType: PAGE_TYPES.APP,
    dev,
    page: 'VAR_PAGE',
    appMod,
    pageMod,
    errorMod,
    error500Mod,
    Document,
    buildManifest,
    prerenderManifest,
    renderToHTML,
    reactLoadableManifest,
    clientReferenceManifest: isServerComponent ? rscManifest : null,
    serverActionsManifest: isServerComponent ? rscServerManifest : null,
    serverActions: isServerComponent ? serverActions : undefined,
    subresourceIntegrityManifest,
    config: nextConfig,
    buildId: 'VAR_BUILD_ID',
    nextFontManifest,
    incrementalCacheHandler,
});
export const ComponentMod = pageMod;
export default function nHandler(opts) {
    return adapter(Object.assign(Object.assign({}, opts), { IncrementalCache, handler: render }));
}