export function getOriginalStackFrame(source, type, errorMessage) {
    var _a, _b;
    async function _getOriginalStackFrame() {
        var _a, _b, _c, _d, _e;
        const params = new URLSearchParams();
        params.append('isServer', String(type === 'server'));
        params.append('isEdgeServer', String(type === 'edge-server'));
        params.append('isAppDirectory', 'true');
        params.append('errorMessage', errorMessage);
        for (const key in source) {
            params.append(key, ((_a = source[key]) !== null && _a !== void 0 ? _a : '').toString());
        }
        const controller = new AbortController();
        const tm = setTimeout(() => controller.abort(), 3000);
        const res = await self
            .fetch(`${process.env.__NEXT_ROUTER_BASEPATH || ''}/__nextjs_original-stack-frame?${params.toString()}`, {
            signal: controller.signal,
        })
            .finally(() => {
            clearTimeout(tm);
        });
        if (!res.ok || res.status === 204) {
            return Promise.reject(new Error(await res.text()));
        }
        const body = await res.json();
        return {
            error: false,
            reason: null,
            external: false,
            expanded: !Boolean(
            /* collapsed */
            (_e = (((_b = source.file) === null || _b === void 0 ? void 0 : _b.includes('node_modules')) ||
                ((_d = (_c = body.originalStackFrame) === null || _c === void 0 ? void 0 : _c.file) === null || _d === void 0 ? void 0 : _d.includes('node_modules')))) !== null && _e !== void 0 ? _e : true),
            sourceStackFrame: source,
            originalStackFrame: body.originalStackFrame,
            originalCodeFrame: body.originalCodeFrame || null,
            sourcePackage: body.sourcePackage,
        };
    }
    if (source.file === '<anonymous>' ||
        ((_a = source.file) === null || _a === void 0 ? void 0 : _a.match(/^node:/)) ||
        ((_b = source.file) === null || _b === void 0 ? void 0 : _b.match(/https?:\/\//))) {
        return Promise.resolve({
            error: false,
            reason: null,
            external: true,
            expanded: false,
            sourceStackFrame: source,
            originalStackFrame: null,
            originalCodeFrame: null,
        });
    }
    return _getOriginalStackFrame().catch((err) => {
        var _a, _b;
        return ({
            error: true,
            reason: (_b = (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err === null || err === void 0 ? void 0 : err.toString()) !== null && _b !== void 0 ? _b : 'Unknown Error',
            external: false,
            expanded: false,
            sourceStackFrame: source,
            originalStackFrame: null,
            originalCodeFrame: null,
        });
    });
}
export function getOriginalStackFrames(frames, type, errorMessage) {
    return Promise.all(frames.map((frame) => getOriginalStackFrame(frame, type, errorMessage)));
}
function formatFrameSourceFile(file) {
    return file
        .replace(/^webpack-internal:(\/)+(\.)?/, '')
        .replace(/^webpack:(\/)+(\.)?/, '');
}
export function getFrameSource(frame) {
    var _a;
    let str = '';
    try {
        const u = new URL(frame.file);
        // Strip the origin for same-origin scripts.
        if (typeof globalThis !== 'undefined' &&
            ((_a = globalThis.location) === null || _a === void 0 ? void 0 : _a.origin) !== u.origin) {
            // URLs can be valid without an `origin`, so long as they have a
            // `protocol`. However, `origin` is preferred.
            if (u.origin === 'null') {
                str += u.protocol;
            }
            else {
                str += u.origin;
            }
        }
        // Strip query string information as it's typically too verbose to be
        // meaningful.
        str += u.pathname;
        str += ' ';
        str = formatFrameSourceFile(str);
    }
    catch (_b) {
        str += formatFrameSourceFile(frame.file || '(unknown)') + ' ';
    }
    if (frame.lineNumber != null) {
        if (frame.column != null) {
            str += `(${frame.lineNumber}:${frame.column}) `;
        }
        else {
            str += `(${frame.lineNumber}) `;
        }
    }
    return str.slice(0, -1);
}
