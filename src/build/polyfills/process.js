"use strict";
var _a, _b;
module.exports =
    ((_a = global.process) === null || _a === void 0 ? void 0 : _a.env) && typeof ((_b = global.process) === null || _b === void 0 ? void 0 : _b.env) === 'object'
        ? global.process
        : require('next/dist/compiled/process');
