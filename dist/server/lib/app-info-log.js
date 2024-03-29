"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    logStartInfo: null,
    getStartServerInfo: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    logStartInfo: function() {
        return logStartInfo;
    },
    getStartServerInfo: function() {
        return getStartServerInfo;
    }
});
const _env = require("@next/env");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _picocolors = require("../../lib/picocolors");
const _constants = require("../../shared/lib/constants");
const _config = /*#__PURE__*/ _interop_require_wildcard(require("../config"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function logStartInfo({ networkUrl, appUrl, envInfo, expFeatureInfo, maxExperimentalFeatures }) {
    _log.bootstrap((0, _picocolors.bold)((0, _picocolors.purple)(` ${_log.prefixes.ready} Next.js ${"14.1.3"}${process.env.TURBOPACK ? " (turbo)" : ""}`)));
    if (appUrl) {
        _log.bootstrap(` - Local:        ${appUrl}`);
    }
    if (networkUrl) {
        _log.bootstrap(` - Network:      ${networkUrl}`);
    }
    if (envInfo == null ? void 0 : envInfo.length) _log.bootstrap(` - Environments: ${envInfo.join(", ")}`);
    if (expFeatureInfo == null ? void 0 : expFeatureInfo.length) {
        _log.bootstrap(` - Experiments (use at your own risk):`);
        // only show maximum 3 flags
        for (const exp of expFeatureInfo.slice(0, maxExperimentalFeatures)){
            _log.bootstrap(`   · ${exp}`);
        }
        /* ${expFeatureInfo.length - 3} more */ if (expFeatureInfo.length > 3 && maxExperimentalFeatures) {
            _log.bootstrap(`   · ...`);
        }
    }
    // New line after the bootstrap info
    _log.info("");
}
async function getStartServerInfo(dir) {
    let expFeatureInfo = [];
    await (0, _config.default)(_constants.PHASE_DEVELOPMENT_SERVER, dir, {
        onLoadUserConfig (userConfig) {
            const userNextConfigExperimental = (0, _config.getEnabledExperimentalFeatures)(userConfig.experimental);
            expFeatureInfo = userNextConfigExperimental.sort((a, b)=>a.length - b.length);
        }
    });
    // we need to reset env if we are going to create
    // the worker process with the esm loader so that the
    // initial env state is correct
    let envInfo = [];
    const { loadedEnvFiles } = (0, _env.loadEnvConfig)(dir, true, console, false);
    if (loadedEnvFiles.length > 0) {
        envInfo = loadedEnvFiles.map((f)=>f.path);
    }
    return {
        envInfo,
        expFeatureInfo
    };
}

//# sourceMappingURL=app-info-log.js.map