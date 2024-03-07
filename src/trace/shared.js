let _traceGlobals = global._traceGlobals;
if (!_traceGlobals) {
    _traceGlobals = new Map();
}
;
global._traceGlobals = _traceGlobals;
export const traceGlobals = _traceGlobals;
export const setGlobal = (key, val) => {
    traceGlobals.set(key, val);
};
