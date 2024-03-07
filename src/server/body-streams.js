var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { PassThrough } from 'stream';
export function requestToBodyStream(context, KUint8Array, stream) {
    return new context.ReadableStream({
        start: async (controller) => {
            var _a, e_1, _b, _c;
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    controller.enqueue(new KUint8Array(chunk));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            controller.close();
        },
    });
}
function replaceRequestBody(base, stream) {
    for (const key in stream) {
        let v = stream[key];
        if (typeof v === 'function') {
            v = v.bind(base);
        }
        base[key] = v;
    }
    return base;
}
export function getCloneableBody(readable) {
    let buffered = null;
    const endPromise = new Promise((resolve, reject) => {
        readable.on('end', resolve);
        readable.on('error', reject);
    }).catch((error) => {
        return { error };
    });
    return {
        /**
         * Replaces the original request body if necessary.
         * This is done because once we read the body from the original request,
         * we can't read it again.
         */
        async finalize() {
            if (buffered) {
                const res = await endPromise;
                if (res && typeof res === 'object' && res.error) {
                    throw res.error;
                }
                replaceRequestBody(readable, buffered);
                buffered = readable;
            }
        },
        /**
         * Clones the body stream
         * to pass into a middleware
         */
        cloneBodyStream() {
            const input = buffered !== null && buffered !== void 0 ? buffered : readable;
            const p1 = new PassThrough();
            const p2 = new PassThrough();
            input.on('data', (chunk) => {
                p1.push(chunk);
                p2.push(chunk);
            });
            input.on('end', () => {
                p1.push(null);
                p2.push(null);
            });
            buffered = p2;
            return p1;
        },
    };
}
