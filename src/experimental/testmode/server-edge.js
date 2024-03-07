import { withRequest as withRequestContext } from './context';
import { interceptFetch, reader } from './fetch';
export function interceptTestApis() {
    return interceptFetch(global.fetch);
}
export function wrapRequestHandler(handler) {
    return (req, fn) => withRequestContext(req, reader, () => handler(req, fn));
}
