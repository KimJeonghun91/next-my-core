import { filterReqHeaders, ipcForbiddenHeaders } from './utils';
export const invokeRequest = async (targetUrl, requestInit, readableBody) => {
    const invokeHeaders = filterReqHeaders(Object.assign({ 'cache-control': '' }, requestInit.headers), ipcForbiddenHeaders);
    return await fetch(targetUrl, Object.assign(Object.assign({ headers: invokeHeaders, method: requestInit.method, redirect: 'manual', signal: requestInit.signal }, (requestInit.method !== 'GET' &&
        requestInit.method !== 'HEAD' &&
        readableBody
        ? {
            body: readableBody,
            duplex: 'half',
        }
        : {})), { next: {
            // @ts-ignore
            internal: true,
        } }));
};
