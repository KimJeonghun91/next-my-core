import { withRequest } from './context';
import { interceptFetch } from './fetch';
import { interceptHttpGet } from './httpget';
const reader = {
    url(req) {
        var _a;
        return (_a = req.url) !== null && _a !== void 0 ? _a : '';
    },
    header(req, name) {
        var _a;
        const h = req.headers[name];
        if (h === undefined || h === null) {
            return null;
        }
        if (typeof h === 'string') {
            return h;
        }
        return (_a = h[0]) !== null && _a !== void 0 ? _a : null;
    },
};
export function interceptTestApis() {
    const originalFetch = global.fetch;
    const restoreFetch = interceptFetch(originalFetch);
    const restoreHttpGet = interceptHttpGet(originalFetch);
    // Cleanup.
    return () => {
        restoreFetch();
        restoreHttpGet();
    };
}
export function wrapRequestHandlerWorker(handler) {
    return (req, res) => withRequest(req, reader, () => handler(req, res));
}
export function wrapRequestHandlerNode(handler) {
    return (req, res, parsedUrl) => withRequest(req, reader, () => handler(req, res, parsedUrl));
}
