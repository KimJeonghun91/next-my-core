import { createReadStream, promises as fs } from 'fs';
import { requestToBodyStream } from '../../body-streams';
import { resolve } from 'path';
/**
 * Short-circuits the `fetch` function
 * to return a stream for a given asset, if a user used `new URL("file", import.meta.url)`.
 * This allows to embed assets in Edge Runtime.
 */
export async function fetchInlineAsset(options) {
    var _a;
    const inputString = String(options.input);
    if (!inputString.startsWith('blob:')) {
        return;
    }
    const hash = inputString.replace('blob:', '');
    const asset = (_a = options.assets) === null || _a === void 0 ? void 0 : _a.find((x) => x.name === hash);
    if (!asset) {
        return;
    }
    const filePath = resolve(options.distDir, asset.filePath);
    const fileIsReadable = await fs.access(filePath).then(() => true, () => false);
    if (fileIsReadable) {
        const readStream = createReadStream(filePath);
        return new options.context.Response(requestToBodyStream(options.context, Uint8Array, readStream));
    }
}
