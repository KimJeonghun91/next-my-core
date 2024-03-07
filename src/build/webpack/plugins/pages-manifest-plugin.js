import path from 'path';
import fs from 'fs/promises';
import { webpack, sources } from 'next/dist/compiled/webpack/webpack';
import { PAGES_MANIFEST, APP_PATHS_MANIFEST, } from '../../../shared/lib/constants';
import getRouteFromEntrypoint from '../../../server/get-route-from-entrypoint';
import { normalizePathSep } from '../../../shared/lib/page-path/normalize-path-sep';
export let edgeServerPages = {};
export let nodeServerPages = {};
export let edgeServerAppPaths = {};
export let nodeServerAppPaths = {};
// This plugin creates a pages-manifest.json from page entrypoints.
// This is used for mapping paths like `/` to `.next/server/static/<buildid>/pages/index.js` when doing SSR
// It's also used by next export to provide defaultPathMap
export default class PagesManifestPlugin {
    constructor({ dev, distDir, isEdgeRuntime, appDirEnabled, }) {
        this.dev = dev;
        this.distDir = distDir;
        this.isEdgeRuntime = isEdgeRuntime;
        this.appDirEnabled = appDirEnabled;
    }
    async createAssets(compilation, assets) {
        const entrypoints = compilation.entrypoints;
        const pages = {};
        const appPaths = {};
        for (const entrypoint of entrypoints.values()) {
            const pagePath = getRouteFromEntrypoint(entrypoint.name, this.appDirEnabled);
            if (!pagePath) {
                continue;
            }
            const files = entrypoint
                .getFiles()
                .filter((file) => !file.includes('webpack-runtime') &&
                !file.includes('webpack-api-runtime') &&
                file.endsWith('.js'));
            // Skip entries which are empty
            if (!files.length) {
                continue;
            }
            // Write filename, replace any backslashes in path (on windows) with forwardslashes for cross-platform consistency.
            let file = files[files.length - 1];
            if (!this.dev) {
                if (!this.isEdgeRuntime) {
                    file = file.slice(3);
                }
            }
            file = normalizePathSep(file);
            if (entrypoint.name.startsWith('app/')) {
                appPaths[pagePath] = file;
            }
            else {
                pages[pagePath] = file;
            }
        }
        // This plugin is used by both the Node server and Edge server compilers,
        // we need to merge both pages to generate the full manifest.
        if (this.isEdgeRuntime) {
            edgeServerPages = pages;
            edgeServerAppPaths = appPaths;
        }
        else {
            nodeServerPages = pages;
            nodeServerAppPaths = appPaths;
        }
        // handle parallel compilers writing to the same
        // manifest path by merging existing manifest with new
        const writeMergedManifest = async (manifestPath, entries) => {
            await fs.mkdir(path.dirname(manifestPath), { recursive: true });
            await fs.writeFile(manifestPath, JSON.stringify(Object.assign(Object.assign({}, (await fs
                .readFile(manifestPath, 'utf8')
                .then((res) => JSON.parse(res))
                .catch(() => ({})))), entries), null, 2));
        };
        if (this.distDir) {
            const pagesManifestPath = path.join(this.distDir, 'server', PAGES_MANIFEST);
            await writeMergedManifest(pagesManifestPath, Object.assign(Object.assign({}, edgeServerPages), nodeServerPages));
        }
        else {
            const pagesManifestPath = (!this.dev && !this.isEdgeRuntime ? '../' : '') + PAGES_MANIFEST;
            assets[pagesManifestPath] = new sources.RawSource(JSON.stringify(Object.assign(Object.assign({}, edgeServerPages), nodeServerPages), null, 2));
        }
        if (this.appDirEnabled) {
            if (this.distDir) {
                const appPathsManifestPath = path.join(this.distDir, 'server', APP_PATHS_MANIFEST);
                await writeMergedManifest(appPathsManifestPath, Object.assign(Object.assign({}, edgeServerAppPaths), nodeServerAppPaths));
            }
            else {
                assets[(!this.dev && !this.isEdgeRuntime ? '../' : '') + APP_PATHS_MANIFEST] = new sources.RawSource(JSON.stringify(Object.assign(Object.assign({}, edgeServerAppPaths), nodeServerAppPaths), null, 2));
            }
        }
    }
    apply(compiler) {
        compiler.hooks.make.tap('NextJsPagesManifest', (compilation) => {
            compilation.hooks.processAssets.tapPromise({
                name: 'NextJsPagesManifest',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            }, (assets) => this.createAssets(compilation, assets));
        });
    }
}