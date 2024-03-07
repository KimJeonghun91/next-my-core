import { ACTION } from '../../client/components/app-router-headers';
export function getServerActionRequestMetadata(req) {
    var _a, _b, _c;
    let actionId;
    let contentType;
    if (req.headers instanceof Headers) {
        actionId = (_a = req.headers.get(ACTION.toLowerCase())) !== null && _a !== void 0 ? _a : null;
        contentType = req.headers.get('content-type');
    }
    else {
        actionId = (_b = req.headers[ACTION.toLowerCase()]) !== null && _b !== void 0 ? _b : null;
        contentType = (_c = req.headers['content-type']) !== null && _c !== void 0 ? _c : null;
    }
    const isURLEncodedAction = Boolean(req.method === 'POST' && contentType === 'application/x-www-form-urlencoded');
    const isMultipartAction = Boolean(req.method === 'POST' && (contentType === null || contentType === void 0 ? void 0 : contentType.startsWith('multipart/form-data')));
    const isFetchAction = Boolean(actionId !== undefined &&
        typeof actionId === 'string' &&
        req.method === 'POST');
    return { actionId, isURLEncodedAction, isMultipartAction, isFetchAction };
}
export function getIsServerAction(req) {
    const { isFetchAction, isURLEncodedAction, isMultipartAction } = getServerActionRequestMetadata(req);
    return Boolean(isFetchAction || isURLEncodedAction || isMultipartAction);
}
