export function printAndExit(message, code = 1) {
    if (code === 0) {
        console.log(message);
    }
    else {
        console.error(message);
    }
    process.exit(code);
}
export const getDebugPort = () => {
    var _a, _b, _c, _d, _e;
    const debugPortStr = (_b = (_a = process.execArgv
        .find((localArg) => localArg.startsWith('--inspect') ||
        localArg.startsWith('--inspect-brk'))) === null || _a === void 0 ? void 0 : _a.split('=', 2)[1]) !== null && _b !== void 0 ? _b : (_e = (_d = (_c = process.env.NODE_OPTIONS) === null || _c === void 0 ? void 0 : _c.match) === null || _d === void 0 ? void 0 : _d.call(_c, /--inspect(-brk)?(=(\S+))?( |$)/)) === null || _e === void 0 ? void 0 : _e[3];
    return debugPortStr ? parseInt(debugPortStr, 10) : 9229;
};
const NODE_INSPECT_RE = /--inspect(-brk)?(=\S+)?( |$)/;
export function getNodeOptionsWithoutInspect() {
    return (process.env.NODE_OPTIONS || '').replace(NODE_INSPECT_RE, '');
}
export function getPort(args) {
    if (typeof args['--port'] === 'number') {
        return args['--port'];
    }
    const parsed = process.env.PORT && parseInt(process.env.PORT, 10);
    if (typeof parsed === 'number' && !Number.isNaN(parsed)) {
        return parsed;
    }
    return 3000;
}
export const RESTART_EXIT_CODE = 77;
export function checkNodeDebugType() {
    var _a, _b, _c, _d;
    let nodeDebugType = undefined;
    if (process.execArgv.some((localArg) => localArg.startsWith('--inspect')) ||
        ((_b = (_a = process.env.NODE_OPTIONS) === null || _a === void 0 ? void 0 : _a.match) === null || _b === void 0 ? void 0 : _b.call(_a, /--inspect(=\S+)?( |$)/))) {
        nodeDebugType = 'inspect';
    }
    if (process.execArgv.some((localArg) => localArg.startsWith('--inspect-brk')) ||
        ((_d = (_c = process.env.NODE_OPTIONS) === null || _c === void 0 ? void 0 : _c.match) === null || _d === void 0 ? void 0 : _d.call(_c, /--inspect-brk(=\S+)?( |$)/))) {
        nodeDebugType = 'inspect-brk';
    }
    return nodeDebugType;
}
export function getMaxOldSpaceSize() {
    var _a, _b;
    const maxOldSpaceSize = (_b = (_a = process.env.NODE_OPTIONS) === null || _a === void 0 ? void 0 : _a.match(/--max-old-space-size=(\d+)/)) === null || _b === void 0 ? void 0 : _b[1];
    return maxOldSpaceSize ? parseInt(maxOldSpaceSize, 10) : undefined;
}
