import { AppRenderSpan, NextNodeServerSpan } from './trace/constants';
import { getTracer, SpanKind } from './trace/tracer';
import { CACHE_ONE_YEAR, NEXT_CACHE_IMPLICIT_TAG_ID, NEXT_CACHE_TAG_MAX_LENGTH, } from '../../lib/constants';
import * as Log from '../../build/output/log';
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
export function validateRevalidate(revalidateVal, pathname) {
    try {
        let normalizedRevalidate = undefined;
        if (revalidateVal === false) {
            normalizedRevalidate = revalidateVal;
        }
        else if (typeof revalidateVal === 'number' &&
            !isNaN(revalidateVal) &&
            revalidateVal > -1) {
            normalizedRevalidate = revalidateVal;
        }
        else if (typeof revalidateVal !== 'undefined') {
            throw new Error(`Invalid revalidate value "${revalidateVal}" on "${pathname}", must be a non-negative number or "false"`);
        }
        return normalizedRevalidate;
    }
    catch (err) {
        // handle client component error from attempting to check revalidate value
        if (err instanceof Error && err.message.includes('Invalid revalidate')) {
            throw err;
        }
        return undefined;
    }
}
export function validateTags(tags, description) {
    const validTags = [];
    const invalidTags = [];
    for (const tag of tags) {
        if (typeof tag !== 'string') {
            invalidTags.push({ tag, reason: 'invalid type, must be a string' });
        }
        else if (tag.length > NEXT_CACHE_TAG_MAX_LENGTH) {
            invalidTags.push({
                tag,
                reason: `exceeded max length of ${NEXT_CACHE_TAG_MAX_LENGTH}`,
            });
        }
        else {
            validTags.push(tag);
        }
    }
    if (invalidTags.length > 0) {
        console.warn(`Warning: invalid tags passed to ${description}: `);
        for (const { tag, reason } of invalidTags) {
            console.log(`tag: "${tag}" ${reason}`);
        }
    }
    return validTags;
}
const getDerivedTags = (pathname) => {
    const derivedTags = [`/layout`];
    // we automatically add the current path segments as tags
    // for revalidatePath handling
    if (pathname.startsWith('/')) {
        const pathnameParts = pathname.split('/');
        for (let i = 1; i < pathnameParts.length + 1; i++) {
            let curPathname = pathnameParts.slice(0, i).join('/');
            if (curPathname) {
                // all derived tags other than the page are layout tags
                if (!curPathname.endsWith('/page') && !curPathname.endsWith('/route')) {
                    curPathname = `${curPathname}${!curPathname.endsWith('/') ? '/' : ''}layout`;
                }
                derivedTags.push(curPathname);
            }
        }
    }
    return derivedTags;
};
export function addImplicitTags(staticGenerationStore) {
    var _a, _b;
    const newTags = [];
    const { pagePath, urlPathname } = staticGenerationStore;
    if (!Array.isArray(staticGenerationStore.tags)) {
        staticGenerationStore.tags = [];
    }
    if (pagePath) {
        const derivedTags = getDerivedTags(pagePath);
        for (let tag of derivedTags) {
            tag = `${NEXT_CACHE_IMPLICIT_TAG_ID}${tag}`;
            if (!((_a = staticGenerationStore.tags) === null || _a === void 0 ? void 0 : _a.includes(tag))) {
                staticGenerationStore.tags.push(tag);
            }
            newTags.push(tag);
        }
    }
    if (urlPathname) {
        const parsedPathname = new URL(urlPathname, 'http://n').pathname;
        const tag = `${NEXT_CACHE_IMPLICIT_TAG_ID}${parsedPathname}`;
        if (!((_b = staticGenerationStore.tags) === null || _b === void 0 ? void 0 : _b.includes(tag))) {
            staticGenerationStore.tags.push(tag);
        }
        newTags.push(tag);
    }
    return newTags;
}
function trackFetchMetric(staticGenerationStore, ctx) {
    if (!staticGenerationStore)
        return;
    if (!staticGenerationStore.fetchMetrics) {
        staticGenerationStore.fetchMetrics = [];
    }
    const dedupeFields = ['url', 'status', 'method'];
    // don't add metric if one already exists for the fetch
    if (staticGenerationStore.fetchMetrics.some((metric) => {
        return dedupeFields.every((field) => metric[field] === ctx[field]);
    })) {
        return;
    }
    staticGenerationStore.fetchMetrics.push({
        url: ctx.url,
        cacheStatus: ctx.cacheStatus,
        cacheReason: ctx.cacheReason,
        status: ctx.status,
        method: ctx.method,
        start: ctx.start,
        end: Date.now(),
        idx: staticGenerationStore.nextFetchId || 0,
    });
}
// we patch fetch to collect cache information used for
// determining if a page is static or not
export function patchFetch({ serverHooks, staticGenerationAsyncStorage, }) {
    if (!globalThis._nextOriginalFetch) {
        ;
        globalThis._nextOriginalFetch = globalThis.fetch;
    }
    if (globalThis.fetch.__nextPatched)
        return;
    const { DynamicServerError } = serverHooks;
    const originFetch = globalThis._nextOriginalFetch;
    globalThis.fetch = async (input, init) => {
        var _a, _b, _c;
        let url;
        try {
            url = new URL(input instanceof Request ? input.url : input);
            url.username = '';
            url.password = '';
        }
        catch (_d) {
            // Error caused by malformed URL should be handled by native fetch
            url = undefined;
        }
        const fetchUrl = (_a = url === null || url === void 0 ? void 0 : url.href) !== null && _a !== void 0 ? _a : '';
        const fetchStart = Date.now();
        const method = ((_b = init === null || init === void 0 ? void 0 : init.method) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'GET';
        // Do create a new span trace for internal fetches in the
        // non-verbose mode.
        const isInternal = ((_c = init === null || init === void 0 ? void 0 : init.next) === null || _c === void 0 ? void 0 : _c.internal) === true;
        const hideSpan = process.env.NEXT_OTEL_FETCH_DISABLED === '1';
        return await getTracer().trace(isInternal ? NextNodeServerSpan.internalFetch : AppRenderSpan.fetch, {
            hideSpan,
            kind: SpanKind.CLIENT,
            spanName: ['fetch', method, fetchUrl].filter(Boolean).join(' '),
            attributes: {
                'http.url': fetchUrl,
                'http.method': method,
                'net.peer.name': url === null || url === void 0 ? void 0 : url.hostname,
                'net.peer.port': (url === null || url === void 0 ? void 0 : url.port) || undefined,
            },
        }, async () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const staticGenerationStore = staticGenerationAsyncStorage.getStore() ||
                ((_b = (_a = fetch).__nextGetStaticStore) === null || _b === void 0 ? void 0 : _b.call(_a));
            const isRequestInput = input &&
                typeof input === 'object' &&
                typeof input.method === 'string';
            const getRequestMeta = (field) => {
                // If request input is present but init is not, retrieve from input first.
                const value = init === null || init === void 0 ? void 0 : init[field];
                return value || (isRequestInput ? input[field] : null);
            };
            // If the staticGenerationStore is not available, we can't do any
            // special treatment of fetch, therefore fallback to the original
            // fetch implementation.
            if (!staticGenerationStore ||
                isInternal ||
                staticGenerationStore.isDraftMode) {
                return originFetch(input, init);
            }
            let revalidate = undefined;
            const getNextField = (field) => {
                var _a, _b, _c;
                return typeof ((_a = init === null || init === void 0 ? void 0 : init.next) === null || _a === void 0 ? void 0 : _a[field]) !== 'undefined'
                    ? (_b = init === null || init === void 0 ? void 0 : init.next) === null || _b === void 0 ? void 0 : _b[field]
                    : isRequestInput
                        ? (_c = input.next) === null || _c === void 0 ? void 0 : _c[field]
                        : undefined;
            };
            // RequestInit doesn't keep extra fields e.g. next so it's
            // only available if init is used separate
            let curRevalidate = getNextField('revalidate');
            const tags = validateTags(getNextField('tags') || [], `fetch ${input.toString()}`);
            if (Array.isArray(tags)) {
                if (!staticGenerationStore.tags) {
                    staticGenerationStore.tags = [];
                }
                for (const tag of tags) {
                    if (!staticGenerationStore.tags.includes(tag)) {
                        staticGenerationStore.tags.push(tag);
                    }
                }
            }
            const implicitTags = addImplicitTags(staticGenerationStore);
            const isOnlyCache = staticGenerationStore.fetchCache === 'only-cache';
            const isForceCache = staticGenerationStore.fetchCache === 'force-cache';
            const isDefaultCache = staticGenerationStore.fetchCache === 'default-cache';
            const isDefaultNoStore = staticGenerationStore.fetchCache === 'default-no-store';
            const isOnlyNoStore = staticGenerationStore.fetchCache === 'only-no-store';
            const isForceNoStore = staticGenerationStore.fetchCache === 'force-no-store';
            const isUsingNoStore = !!staticGenerationStore.isUnstableNoStore;
            let _cache = getRequestMeta('cache');
            let cacheReason = '';
            if (typeof _cache === 'string' &&
                typeof curRevalidate !== 'undefined') {
                // when providing fetch with a Request input, it'll automatically set a cache value of 'default'
                // we only want to warn if the user is explicitly setting a cache value
                if (!(isRequestInput && _cache === 'default')) {
                    Log.warn(`fetch for ${fetchUrl} on ${staticGenerationStore.urlPathname} specified "cache: ${_cache}" and "revalidate: ${curRevalidate}", only one should be specified.`);
                }
                _cache = undefined;
            }
            if (_cache === 'force-cache') {
                curRevalidate = false;
            }
            else if (_cache === 'no-cache' ||
                _cache === 'no-store' ||
                isForceNoStore ||
                isOnlyNoStore) {
                curRevalidate = 0;
            }
            if (_cache === 'no-cache' || _cache === 'no-store') {
                cacheReason = `cache: ${_cache}`;
            }
            revalidate = validateRevalidate(curRevalidate, staticGenerationStore.urlPathname);
            const _headers = getRequestMeta('headers');
            const initHeaders = typeof (_headers === null || _headers === void 0 ? void 0 : _headers.get) === 'function'
                ? _headers
                : new Headers(_headers || {});
            const hasUnCacheableHeader = initHeaders.get('authorization') || initHeaders.get('cookie');
            const isUnCacheableMethod = !['get', 'head'].includes(((_c = getRequestMeta('method')) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || 'get');
            // if there are authorized headers or a POST method and
            // dynamic data usage was present above the tree we bail
            // e.g. if cookies() is used before an authed/POST fetch
            const autoNoCache = (hasUnCacheableHeader || isUnCacheableMethod) &&
                staticGenerationStore.revalidate === 0;
            if (isForceNoStore) {
                cacheReason = 'fetchCache = force-no-store';
            }
            if (isOnlyNoStore) {
                if (_cache === 'force-cache' ||
                    (typeof revalidate !== 'undefined' &&
                        (revalidate === false || revalidate > 0))) {
                    throw new Error(`cache: 'force-cache' used on fetch for ${fetchUrl} with 'export const fetchCache = 'only-no-store'`);
                }
                cacheReason = 'fetchCache = only-no-store';
            }
            if (isOnlyCache && _cache === 'no-store') {
                throw new Error(`cache: 'no-store' used on fetch for ${fetchUrl} with 'export const fetchCache = 'only-cache'`);
            }
            if (isForceCache &&
                (typeof curRevalidate === 'undefined' || curRevalidate === 0)) {
                cacheReason = 'fetchCache = force-cache';
                revalidate = false;
            }
            if (typeof revalidate === 'undefined') {
                if (isDefaultCache) {
                    revalidate = false;
                    cacheReason = 'fetchCache = default-cache';
                }
                else if (autoNoCache) {
                    revalidate = 0;
                    cacheReason = 'auto no cache';
                }
                else if (isDefaultNoStore) {
                    revalidate = 0;
                    cacheReason = 'fetchCache = default-no-store';
                }
                else if (isUsingNoStore) {
                    revalidate = 0;
                    cacheReason = 'noStore call';
                }
                else {
                    cacheReason = 'auto cache';
                    revalidate =
                        typeof staticGenerationStore.revalidate === 'boolean' ||
                            typeof staticGenerationStore.revalidate === 'undefined'
                            ? false
                            : staticGenerationStore.revalidate;
                }
            }
            else if (!cacheReason) {
                cacheReason = `revalidate: ${revalidate}`;
            }
            if (
            // when force static is configured we don't bail from
            // `revalidate: 0` values
            !(staticGenerationStore.forceStatic && revalidate === 0) &&
                // we don't consider autoNoCache to switch to dynamic during
                // revalidate although if it occurs during build we do
                !autoNoCache &&
                // If the revalidate value isn't currently set or the value is less
                // than the current revalidate value, we should update the revalidate
                // value.
                (typeof staticGenerationStore.revalidate === 'undefined' ||
                    (typeof revalidate === 'number' &&
                        (staticGenerationStore.revalidate === false ||
                            (typeof staticGenerationStore.revalidate === 'number' &&
                                revalidate < staticGenerationStore.revalidate))))) {
                // If we were setting the revalidate value to 0, we should try to
                // postpone instead first.
                if (revalidate === 0) {
                    (_d = staticGenerationStore.postpone) === null || _d === void 0 ? void 0 : _d.call(staticGenerationStore, 'revalidate: 0');
                }
                staticGenerationStore.revalidate = revalidate;
            }
            const isCacheableRevalidate = (typeof revalidate === 'number' && revalidate > 0) ||
                revalidate === false;
            let cacheKey;
            if (staticGenerationStore.incrementalCache && isCacheableRevalidate) {
                try {
                    cacheKey =
                        await staticGenerationStore.incrementalCache.fetchCacheKey(fetchUrl, isRequestInput ? input : init);
                }
                catch (err) {
                    console.error(`Failed to generate cache key for`, input);
                }
            }
            const fetchIdx = (_e = staticGenerationStore.nextFetchId) !== null && _e !== void 0 ? _e : 1;
            staticGenerationStore.nextFetchId = fetchIdx + 1;
            const normalizedRevalidate = typeof revalidate !== 'number' ? CACHE_ONE_YEAR : revalidate;
            const doOriginalFetch = async (isStale, cacheReasonOverride) => {
                const requestInputFields = [
                    'cache',
                    'credentials',
                    'headers',
                    'integrity',
                    'keepalive',
                    'method',
                    'mode',
                    'redirect',
                    'referrer',
                    'referrerPolicy',
                    'window',
                    'duplex',
                    // don't pass through signal when revalidating
                    ...(isStale ? [] : ['signal']),
                ];
                if (isRequestInput) {
                    const reqInput = input;
                    const reqOptions = {
                        body: reqInput._ogBody || reqInput.body,
                    };
                    for (const field of requestInputFields) {
                        // @ts-expect-error custom fields
                        reqOptions[field] = reqInput[field];
                    }
                    input = new Request(reqInput.url, reqOptions);
                }
                else if (init) {
                    const initialInit = init;
                    init = {
                        body: init._ogBody || init.body,
                    };
                    for (const field of requestInputFields) {
                        // @ts-expect-error custom fields
                        init[field] = initialInit[field];
                    }
                }
                // add metadata to init without editing the original
                const clonedInit = Object.assign(Object.assign({}, init), { next: Object.assign(Object.assign({}, init === null || init === void 0 ? void 0 : init.next), { fetchType: 'origin', fetchIdx }) });
                return originFetch(input, clonedInit).then(async (res) => {
                    if (!isStale) {
                        trackFetchMetric(staticGenerationStore, {
                            start: fetchStart,
                            url: fetchUrl,
                            cacheReason: cacheReasonOverride || cacheReason,
                            cacheStatus: revalidate === 0 || cacheReasonOverride ? 'skip' : 'miss',
                            status: res.status,
                            method: clonedInit.method || 'GET',
                        });
                    }
                    if (res.status === 200 &&
                        staticGenerationStore.incrementalCache &&
                        cacheKey &&
                        isCacheableRevalidate) {
                        const bodyBuffer = Buffer.from(await res.arrayBuffer());
                        try {
                            await staticGenerationStore.incrementalCache.set(cacheKey, {
                                kind: 'FETCH',
                                data: {
                                    headers: Object.fromEntries(res.headers.entries()),
                                    body: bodyBuffer.toString('base64'),
                                    status: res.status,
                                    url: res.url,
                                },
                                revalidate: normalizedRevalidate,
                            }, {
                                fetchCache: true,
                                revalidate,
                                fetchUrl,
                                fetchIdx,
                                tags,
                            });
                        }
                        catch (err) {
                            console.warn(`Failed to set fetch cache`, input, err);
                        }
                        const response = new Response(bodyBuffer, {
                            headers: new Headers(res.headers),
                            status: res.status,
                        });
                        Object.defineProperty(response, 'url', { value: res.url });
                        return response;
                    }
                    return res;
                });
            };
            let handleUnlock = () => Promise.resolve();
            let cacheReasonOverride;
            if (cacheKey && staticGenerationStore.incrementalCache) {
                handleUnlock = await staticGenerationStore.incrementalCache.lock(cacheKey);
                const entry = staticGenerationStore.isOnDemandRevalidate
                    ? null
                    : await staticGenerationStore.incrementalCache.get(cacheKey, {
                        kindHint: 'fetch',
                        revalidate,
                        fetchUrl,
                        fetchIdx,
                        tags,
                        softTags: implicitTags,
                    });
                if (entry) {
                    await handleUnlock();
                }
                else {
                    // in dev, incremental cache response will be null in case the browser adds `cache-control: no-cache` in the request headers
                    cacheReasonOverride = 'cache-control: no-cache (hard refresh)';
                }
                if ((entry === null || entry === void 0 ? void 0 : entry.value) && entry.value.kind === 'FETCH') {
                    // when stale and is revalidating we wait for fresh data
                    // so the revalidated entry has the updated data
                    if (!(staticGenerationStore.isRevalidate && entry.isStale)) {
                        if (entry.isStale) {
                            (_f = staticGenerationStore.pendingRevalidates) !== null && _f !== void 0 ? _f : (staticGenerationStore.pendingRevalidates = {});
                            if (!staticGenerationStore.pendingRevalidates[cacheKey]) {
                                staticGenerationStore.pendingRevalidates[cacheKey] =
                                    doOriginalFetch(true).catch(console.error);
                            }
                        }
                        const resData = entry.value.data;
                        trackFetchMetric(staticGenerationStore, {
                            start: fetchStart,
                            url: fetchUrl,
                            cacheReason,
                            cacheStatus: 'hit',
                            status: resData.status || 200,
                            method: (init === null || init === void 0 ? void 0 : init.method) || 'GET',
                        });
                        const response = new Response(Buffer.from(resData.body, 'base64'), {
                            headers: resData.headers,
                            status: resData.status,
                        });
                        Object.defineProperty(response, 'url', {
                            value: entry.value.data.url,
                        });
                        return response;
                    }
                }
            }
            if (staticGenerationStore.isStaticGeneration &&
                init &&
                typeof init === 'object') {
                const { cache } = init;
                // Delete `cache` property as Cloudflare Workers will throw an error
                if (isEdgeRuntime)
                    delete init.cache;
                if (!staticGenerationStore.forceStatic && cache === 'no-store') {
                    const dynamicUsageReason = `no-store fetch ${input}${staticGenerationStore.urlPathname
                        ? ` ${staticGenerationStore.urlPathname}`
                        : ''}`;
                    // If enabled, we should bail out of static generation.
                    (_g = staticGenerationStore.postpone) === null || _g === void 0 ? void 0 : _g.call(staticGenerationStore, dynamicUsageReason);
                    // PPR is not enabled, or React postpone is not available, we
                    // should set the revalidate to 0.
                    staticGenerationStore.revalidate = 0;
                    const err = new DynamicServerError(dynamicUsageReason);
                    staticGenerationStore.dynamicUsageErr = err;
                    staticGenerationStore.dynamicUsageDescription = dynamicUsageReason;
                }
                const hasNextConfig = 'next' in init;
                const { next = {} } = init;
                if (typeof next.revalidate === 'number' &&
                    (typeof staticGenerationStore.revalidate === 'undefined' ||
                        (typeof staticGenerationStore.revalidate === 'number' &&
                            next.revalidate < staticGenerationStore.revalidate))) {
                    if (!staticGenerationStore.forceDynamic &&
                        !staticGenerationStore.forceStatic &&
                        next.revalidate === 0) {
                        const dynamicUsageReason = `revalidate: 0 fetch ${input}${staticGenerationStore.urlPathname
                            ? ` ${staticGenerationStore.urlPathname}`
                            : ''}`;
                        // If enabled, we should bail out of static generation.
                        (_h = staticGenerationStore.postpone) === null || _h === void 0 ? void 0 : _h.call(staticGenerationStore, dynamicUsageReason);
                        const err = new DynamicServerError(dynamicUsageReason);
                        staticGenerationStore.dynamicUsageErr = err;
                        staticGenerationStore.dynamicUsageDescription = dynamicUsageReason;
                    }
                    if (!staticGenerationStore.forceStatic || next.revalidate !== 0) {
                        staticGenerationStore.revalidate = next.revalidate;
                    }
                }
                if (hasNextConfig)
                    delete init.next;
            }
            return doOriginalFetch(false, cacheReasonOverride).finally(handleUnlock);
        });
    };
    globalThis.fetch.__nextGetStaticStore = () => {
        return staticGenerationAsyncStorage;
    };
    globalThis.fetch.__nextPatched = true;
}
