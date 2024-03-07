var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { readFileSync } from 'fs';
import JSON5 from 'next/dist/compiled/json5';
import { createConfigItem, loadOptions } from 'next/dist/compiled/babel/core';
import loadConfig from 'next/dist/compiled/babel/core-lib-config';
import { consumeIterator } from './util';
import * as Log from '../../output/log';
const nextDistPath = /(next[\\/]dist[\\/]shared[\\/]lib)|(next[\\/]dist[\\/]client)|(next[\\/]dist[\\/]pages)/;
const fileExtensionRegex = /\.([a-z]+)$/;
function getCacheCharacteristics(loaderOptions, source, filename) {
    var _a;
    const { isServer, pagesDir } = loaderOptions;
    const isPageFile = filename.startsWith(pagesDir);
    const isNextDist = nextDistPath.test(filename);
    const hasModuleExports = source.indexOf('module.exports') !== -1;
    const fileExt = ((_a = fileExtensionRegex.exec(filename)) === null || _a === void 0 ? void 0 : _a[1]) || 'unknown';
    return {
        isServer,
        isPageFile,
        isNextDist,
        hasModuleExports,
        fileExt,
    };
}
/**
 * Return an array of Babel plugins, conditioned upon loader options and
 * source file characteristics.
 */
function getPlugins(loaderOptions, cacheCharacteristics) {
    const { isServer, isPageFile, isNextDist, hasModuleExports } = cacheCharacteristics;
    const { hasReactRefresh, development } = loaderOptions;
    const applyCommonJsItem = hasModuleExports
        ? createConfigItem(require('../plugins/commonjs'), { type: 'plugin' })
        : null;
    const reactRefreshItem = hasReactRefresh
        ? createConfigItem([
            require('next/dist/compiled/react-refresh/babel'),
            { skipEnvCheck: true },
        ], { type: 'plugin' })
        : null;
    const pageConfigItem = !isServer && isPageFile
        ? createConfigItem([require('../plugins/next-page-config')], {
            type: 'plugin',
        })
        : null;
    const disallowExportAllItem = !isServer && isPageFile
        ? createConfigItem([require('../plugins/next-page-disallow-re-export-all-exports')], { type: 'plugin' })
        : null;
    const transformDefineItem = createConfigItem([
        require.resolve('next/dist/compiled/babel/plugin-transform-define'),
        {
            'process.env.NODE_ENV': development ? 'development' : 'production',
            'typeof window': isServer ? 'undefined' : 'object',
            'process.browser': isServer ? false : true,
        },
        'next-js-transform-define-instance',
    ], { type: 'plugin' });
    const nextSsgItem = !isServer && isPageFile
        ? createConfigItem([require.resolve('../plugins/next-ssg-transform')], {
            type: 'plugin',
        })
        : null;
    const commonJsItem = isNextDist
        ? createConfigItem(require('next/dist/compiled/babel/plugin-transform-modules-commonjs'), { type: 'plugin' })
        : null;
    const nextFontUnsupported = createConfigItem([require('../plugins/next-font-unsupported')], { type: 'plugin' });
    return [
        reactRefreshItem,
        pageConfigItem,
        disallowExportAllItem,
        applyCommonJsItem,
        transformDefineItem,
        nextSsgItem,
        commonJsItem,
        nextFontUnsupported,
    ].filter(Boolean);
}
const isJsonFile = /\.(json|babelrc)$/;
const isJsFile = /\.js$/;
/**
 * While this function does block execution while reading from disk, it
 * should not introduce any issues.  The function is only invoked when
 * generating a fresh config, and only a small handful of configs should
 * be generated during compilation.
 */
function getCustomBabelConfig(configFilePath) {
    if (isJsonFile.exec(configFilePath)) {
        const babelConfigRaw = readFileSync(configFilePath, 'utf8');
        return JSON5.parse(babelConfigRaw);
    }
    else if (isJsFile.exec(configFilePath)) {
        return require(configFilePath);
    }
    throw new Error('The Next.js Babel loader does not support .mjs or .cjs config files.');
}
let babelConfigWarned = false;
/**
 * Check if custom babel configuration from user only contains options that
 * can be migrated into latest Next.js features supported by SWC.
 *
 * This raises soft warning messages only, not making any errors yet.
 */
function checkCustomBabelConfigDeprecation(config) {
    if (!config || Object.keys(config).length === 0) {
        return;
    }
    const { plugins, presets } = config, otherOptions = __rest(config, ["plugins", "presets"]);
    if (Object.keys(otherOptions !== null && otherOptions !== void 0 ? otherOptions : {}).length > 0) {
        return;
    }
    if (babelConfigWarned) {
        return;
    }
    babelConfigWarned = true;
    const isPresetReadyToDeprecate = !presets ||
        presets.length === 0 ||
        (presets.length === 1 && presets[0] === 'next/babel');
    const pluginReasons = [];
    const unsupportedPlugins = [];
    if (Array.isArray(plugins)) {
        for (const plugin of plugins) {
            const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
            // [NOTE]: We cannot detect if the user uses babel-plugin-macro based transform plugins,
            // such as `styled-components/macro` in here.
            switch (pluginName) {
                case 'styled-components':
                case 'babel-plugin-styled-components':
                    pluginReasons.push(`\t- 'styled-components' can be enabled via 'compiler.styledComponents' in 'next.config.js'`);
                    break;
                case '@emotion/babel-plugin':
                    pluginReasons.push(`\t- '@emotion/babel-plugin' can be enabled via 'compiler.emotion' in 'next.config.js'`);
                    break;
                case 'babel-plugin-relay':
                    pluginReasons.push(`\t- 'babel-plugin-relay' can be enabled via 'compiler.relay' in 'next.config.js'`);
                    break;
                case 'react-remove-properties':
                    pluginReasons.push(`\t- 'react-remove-properties' can be enabled via 'compiler.reactRemoveProperties' in 'next.config.js'`);
                    break;
                case 'transform-remove-console':
                    pluginReasons.push(`\t- 'transform-remove-console' can be enabled via 'compiler.removeConsole' in 'next.config.js'`);
                    break;
                default:
                    unsupportedPlugins.push(pluginName);
                    break;
            }
        }
    }
    if (isPresetReadyToDeprecate && unsupportedPlugins.length === 0) {
        Log.warn(`It looks like there is a custom Babel configuration that can be removed${pluginReasons.length > 0 ? ':' : '.'}`);
        if (pluginReasons.length > 0) {
            Log.warn(`Next.js supports the following features natively: `);
            Log.warn(pluginReasons.join(''));
            Log.warn(`For more details configuration options, please refer https://nextjs.org/docs/architecture/nextjs-compiler#supported-features`);
        }
    }
}
/**
 * Generate a new, flat Babel config, ready to be handed to Babel-traverse.
 * This config should have no unresolved overrides, presets, etc.
 */
function getFreshConfig(cacheCharacteristics, loaderOptions, target, filename, inputSourceMap) {
    let { isServer, pagesDir, development, hasJsxRuntime, configFile } = loaderOptions;
    let customConfig = configFile
        ? getCustomBabelConfig(configFile)
        : undefined;
    checkCustomBabelConfigDeprecation(customConfig);
    let options = {
        babelrc: false,
        cloneInputAst: false,
        filename,
        inputSourceMap: inputSourceMap || undefined,
        // Set the default sourcemap behavior based on Webpack's mapping flag,
        // but allow users to override if they want.
        sourceMaps: loaderOptions.sourceMaps === undefined
            ? this.sourceMap
            : loaderOptions.sourceMaps,
        // Ensure that Webpack will get a full absolute path in the sourcemap
        // so that it can properly map the module back to its internal cached
        // modules.
        sourceFileName: filename,
        plugins: [
            ...getPlugins(loaderOptions, cacheCharacteristics),
            ...((customConfig === null || customConfig === void 0 ? void 0 : customConfig.plugins) || []),
        ],
        // target can be provided in babelrc
        target: isServer ? undefined : customConfig === null || customConfig === void 0 ? void 0 : customConfig.target,
        // env can be provided in babelrc
        env: customConfig === null || customConfig === void 0 ? void 0 : customConfig.env,
        presets: (() => {
            // If presets is defined the user will have next/babel in their babelrc
            if (customConfig === null || customConfig === void 0 ? void 0 : customConfig.presets) {
                return customConfig.presets;
            }
            // If presets is not defined the user will likely have "env" in their babelrc
            if (customConfig) {
                return undefined;
            }
            // If no custom config is provided the default is to use next/babel
            return ['next/babel'];
        })(),
        overrides: loaderOptions.overrides,
        caller: Object.assign({ name: 'next-babel-turbo-loader', supportsStaticESM: true, supportsDynamicImport: true, 
            // Provide plugins with insight into webpack target.
            // https://github.com/babel/babel-loader/issues/787
            target: target, 
            // Webpack 5 supports TLA behind a flag. We enable it by default
            // for Babel, and then webpack will throw an error if the experimental
            // flag isn't enabled.
            supportsTopLevelAwait: true, isServer,
            pagesDir, isDev: development, hasJsxRuntime }, loaderOptions.caller),
    };
    // Babel does strict checks on the config so undefined is not allowed
    if (typeof options.target === 'undefined') {
        delete options.target;
    }
    Object.defineProperty(options.caller, 'onWarning', {
        enumerable: false,
        writable: false,
        value: (reason) => {
            if (!(reason instanceof Error)) {
                reason = new Error(reason);
            }
            this.emitWarning(reason);
        },
    });
    const loadedOptions = loadOptions(options);
    const config = consumeIterator(loadConfig(loadedOptions));
    return config;
}
/**
 * Each key returned here corresponds with a Babel config that can be shared.
 * The conditions of permissible sharing between files is dependent on specific
 * file attributes and Next.js compiler states: `CharacteristicsGermaneToCaching`.
 */
function getCacheKey(cacheCharacteristics) {
    const { isServer, isPageFile, isNextDist, hasModuleExports, fileExt } = cacheCharacteristics;
    const flags = 0 |
        (isServer ? 0b0001 : 0) |
        (isPageFile ? 0b0010 : 0) |
        (isNextDist ? 0b0100 : 0) |
        (hasModuleExports ? 0b1000 : 0);
    return fileExt + flags;
}
const configCache = new Map();
const configFiles = new Set();
export default function getConfig({ source, target, loaderOptions, filename, inputSourceMap, }) {
    const cacheCharacteristics = getCacheCharacteristics(loaderOptions, source, filename);
    if (loaderOptions.configFile) {
        // Ensures webpack invalidates the cache for this loader when the config file changes
        this.addDependency(loaderOptions.configFile);
    }
    const cacheKey = getCacheKey(cacheCharacteristics);
    if (configCache.has(cacheKey)) {
        const cachedConfig = configCache.get(cacheKey);
        return Object.assign(Object.assign({}, cachedConfig), { options: Object.assign(Object.assign({}, cachedConfig.options), { cwd: loaderOptions.cwd, root: loaderOptions.cwd, filename, sourceFileName: filename }) });
    }
    if (loaderOptions.configFile && !configFiles.has(loaderOptions.configFile)) {
        configFiles.add(loaderOptions.configFile);
        Log.info(`Using external babel configuration from ${loaderOptions.configFile}`);
    }
    const freshConfig = getFreshConfig.call(this, cacheCharacteristics, loaderOptions, target, filename, inputSourceMap);
    configCache.set(cacheKey, freshConfig);
    return freshConfig;
}