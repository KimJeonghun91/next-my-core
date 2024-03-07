var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { ABORT, CONTINUE, UNHANDLED } from './types';
function buildRequest(req) {
    const { request: proxyRequest } = req;
    const { url, headers, body } = proxyRequest, options = __rest(proxyRequest, ["url", "headers", "body"]);
    return new Request(url, Object.assign(Object.assign({}, options), { headers: new Headers(headers), body: body ? Buffer.from(body, 'base64') : null }));
}
async function buildResponse(response) {
    if (!response) {
        return UNHANDLED;
    }
    if (response === 'abort') {
        return ABORT;
    }
    if (response === 'continue') {
        return CONTINUE;
    }
    const { status, headers, body } = response;
    return {
        api: 'fetch',
        response: {
            status,
            headers: Array.from(headers),
            body: body
                ? Buffer.from(await response.arrayBuffer()).toString('base64')
                : null,
        },
    };
}
export async function handleFetch(req, onFetch) {
    const { testData } = req;
    const request = buildRequest(req);
    const response = await onFetch(testData, request);
    return buildResponse(response);
}
