import { parse } from 'next/dist/compiled/stacktrace-parser';
const regexNextStatic = /\/_next(\/static\/.+)/;
export function parseStack(stack) {
    const frames = parse(stack);
    return frames.map((frame) => {
        var _a, _b;
        try {
            const url = new URL(frame.file);
            const res = regexNextStatic.exec(url.pathname);
            if (res) {
                const distDir = (_b = (_a = process.env.__NEXT_DIST_DIR) === null || _a === void 0 ? void 0 : _a.replace(/\\/g, '/')) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, '');
                if (distDir) {
                    frame.file = 'file://' + distDir.concat(res.pop());
                }
            }
        }
        catch (_c) { }
        return frame;
    });
}
