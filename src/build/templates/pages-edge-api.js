import '../../server/web/globals';
import { adapter } from '../../server/web/adapter';
import { IncrementalCache } from '../../server/lib/incremental-cache';
// Import the userland code.
import handler from 'VAR_USERLAND';
const page = 'VAR_DEFINITION_PAGE';
if (typeof handler !== 'function') {
    throw new Error(`The Edge Function "pages${page}" must export a \`default\` function`);
}
export default function (opts) {
    return adapter(Object.assign(Object.assign({}, opts), { IncrementalCache, page: 'VAR_DEFINITION_PATHNAME', handler }));
}
