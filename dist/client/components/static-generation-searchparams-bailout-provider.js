"use client";

"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return StaticGenerationSearchParamsBailoutProvider;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _jsxruntime = require("react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_default._(require("react"));
const _searchparamsbailoutproxy = require("./searchparams-bailout-proxy");
function StaticGenerationSearchParamsBailoutProvider(param) {
    let { Component, propsForComponent, isStaticGeneration } = param;
    if (isStaticGeneration) {
        const searchParams = (0, _searchparamsbailoutproxy.createSearchParamsBailoutProxy)();
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(Component, {
            searchParams: searchParams,
            ...propsForComponent
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(Component, {
        ...propsForComponent
    });
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=static-generation-searchparams-bailout-provider.js.map