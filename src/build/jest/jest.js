import { loadEnvConfig } from '@next/env';
import { resolve, join } from 'path';
import loadConfig from '../../server/config';
import { PHASE_TEST } from '../../shared/lib/constants';
import loadJsConfig from '../load-jsconfig';
import * as Log from '../output/log';
import { findPagesDir } from '../../lib/find-pages-dir';
import { loadBindings, lockfilePatchPromise } from '../swc';
async function getConfig(dir) {
    const conf = await loadConfig(PHASE_TEST, dir);
    return conf;
}
/**
 * Loads closest package.json in the directory hierarchy
 */
function loadClosestPackageJson(dir, attempts = 1) {
    if (attempts > 5) {
        throw new Error("Can't resolve main package.json file");
    }
    var mainPath = attempts === 1 ? './' : Array(attempts).join('../');
    try {
        return require(join(dir, mainPath + 'package.json'));
    }
    catch (e) {
        return loadClosestPackageJson(dir, attempts + 1);
    }
}
/** Loads dotenv files and sets environment variables based on next config. */
function setUpEnv(dir) {
    const dev = false;
    loadEnvConfig(dir, dev, Log);
}
/*
// Usage in jest.config.js
const nextJest = require('next/jest');

// Optionally provide path to Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir })

// Any custom config you want to pass to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
*/
export default function nextJest(options = {}) {
    // createJestConfig
    return (customJestConfig) => {
        // Function that is provided as the module.exports of jest.config.js
        // Will be called and awaited by Jest
        return async () => {
            var _a, _b, _c, _d;
            let nextConfig;
            let jsConfig;
            let resolvedBaseUrl;
            let isEsmProject = false;
            let pagesDir;
            let serverComponents;
            if (options.dir) {
                const resolvedDir = resolve(options.dir);
                const packageConfig = loadClosestPackageJson(resolvedDir);
                isEsmProject = packageConfig.type === 'module';
                nextConfig = await getConfig(resolvedDir);
                const findPagesDirResult = findPagesDir(resolvedDir);
                serverComponents = !!findPagesDirResult.appDir;
                pagesDir = findPagesDirResult.pagesDir;
                setUpEnv(resolvedDir);
                // TODO: revisit when bug in SWC is fixed that strips `.css`
                const result = await loadJsConfig(resolvedDir, nextConfig);
                jsConfig = result.jsConfig;
                resolvedBaseUrl = result.resolvedBaseUrl;
            }
            // Ensure provided async config is supported
            const resolvedJestConfig = (_a = (typeof customJestConfig === 'function'
                ? await customJestConfig()
                : customJestConfig)) !== null && _a !== void 0 ? _a : {};
            // eagerly load swc bindings instead of waiting for transform calls
            await loadBindings((_b = nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.experimental) === null || _b === void 0 ? void 0 : _b.useWasmBinary);
            if (lockfilePatchPromise.cur) {
                await lockfilePatchPromise.cur;
            }
            const transpiled = ((_c = nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.transpilePackages) !== null && _c !== void 0 ? _c : []).join('|');
            const jestTransformerConfig = {
                modularizeImports: nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.modularizeImports,
                swcPlugins: (_d = nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.experimental) === null || _d === void 0 ? void 0 : _d.swcPlugins,
                compilerOptions: nextConfig === null || nextConfig === void 0 ? void 0 : nextConfig.compiler,
                jsConfig,
                resolvedBaseUrl,
                serverComponents,
                isEsmProject,
                pagesDir,
            };
            return Object.assign(Object.assign({}, resolvedJestConfig), { moduleNameMapper: Object.assign({ 
                    // Handle CSS imports (with CSS modules)
                    // https://jestjs.io/docs/webpack#mocking-css-modules
                    '^.+\\.module\\.(css|sass|scss)$': require.resolve('./object-proxy.js'), 
                    // Handle CSS imports (without CSS modules)
                    '^.+\\.(css|sass|scss)$': require.resolve('./__mocks__/styleMock.js'), 
                    // Handle image imports
                    '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp)$': require.resolve(`./__mocks__/fileMock.js`), 
                    // Keep .svg to it's own rule to make overriding easy
                    '^.+\\.(svg)$': require.resolve(`./__mocks__/fileMock.js`), 
                    // Handle @next/font
                    '@next/font/(.*)': require.resolve('./__mocks__/nextFontMock.js'), 
                    // Handle next/font
                    'next/font/(.*)': require.resolve('./__mocks__/nextFontMock.js'), 
                    // Disable server-only
                    'server-only': require.resolve('./__mocks__/empty.js') }, (resolvedJestConfig.moduleNameMapper || {})), testPathIgnorePatterns: [
                    // Don't look for tests in node_modules
                    '/node_modules/',
                    // Don't look for tests in the Next.js build output
                    '/.next/',
                    // Custom config can append to testPathIgnorePatterns but not modify it
                    // This is to ensure `.next` and `node_modules` are always excluded
                    ...(resolvedJestConfig.testPathIgnorePatterns || []),
                ], transform: Object.assign({ 
                    // Use SWC to compile tests
                    '^.+\\.(js|jsx|ts|tsx|mjs)$': [
                        require.resolve('../swc/jest-transformer'),
                        jestTransformerConfig,
                    ] }, (resolvedJestConfig.transform || {})), transformIgnorePatterns: [
                    // To match Next.js behavior node_modules is not transformed, only `transpiledPackages`
                    ...(transpiled
                        ? [
                            `/node_modules/(?!.pnpm)(?!(${transpiled})/)`,
                            `/node_modules/.pnpm/(?!(${transpiled.replace(/\//g, '\\+')})@)`,
                        ]
                        : ['/node_modules/']),
                    // CSS modules are mocked so they don't need to be transformed
                    '^.+\\.module\\.(css|sass|scss)$',
                    // Custom config can append to transformIgnorePatterns but not modify it
                    // This is to ensure `node_modules` and .module.css/sass/scss are always excluded
                    ...(resolvedJestConfig.transformIgnorePatterns || []),
                ], watchPathIgnorePatterns: [
                    // Don't re-run tests when the Next.js build output changes
                    '/.next/',
                    ...(resolvedJestConfig.watchPathIgnorePatterns || []),
                ] });
        };
    };
}
