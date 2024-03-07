/**
COPYRIGHT (c) 2017-present James Kyle <me@thejameskyle.com>
 MIT License
 Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
 The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWAR
*/
// Implementation of this PR: https://github.com/jamiebuilds/react-loadable/pull/132
// Modified to strip out unneeded results for Next's specific use case
import { webpack, sources } from 'next/dist/compiled/webpack/webpack';
import path from 'path';
function getModuleId(compilation, module) {
    return compilation.chunkGraph.getModuleId(module);
}
function getModuleFromDependency(compilation, dep) {
    return compilation.moduleGraph.getModule(dep);
}
function getOriginModuleFromDependency(compilation, dep) {
    return compilation.moduleGraph.getParentModule(dep);
}
function getChunkGroupFromBlock(compilation, block) {
    return compilation.chunkGraph.getBlockChunkGroup(block);
}
function buildManifest(_compiler, compilation, pagesDir, dev) {
    // If there's no pagesDir, output an empty manifest
    if (!pagesDir) {
        return {};
    }
    let manifest = {};
    // This is allowed:
    // import("./module"); <- ImportDependency
    // We don't support that:
    // import(/* webpackMode: "eager" */ "./module") <- ImportEagerDependency
    // import(`./module/${param}`) <- ImportContextDependency
    // Find all dependencies blocks which contains a `import()` dependency
    const handleBlock = (block) => {
        block.blocks.forEach(handleBlock);
        const chunkGroup = getChunkGroupFromBlock(compilation, block);
        for (const dependency of block.dependencies) {
            if (dependency.type.startsWith('import()')) {
                // get the referenced module
                const module = getModuleFromDependency(compilation, dependency);
                if (!module)
                    return;
                // get the module containing the import()
                const originModule = getOriginModuleFromDependency(compilation, dependency);
                const originRequest = originModule === null || originModule === void 0 ? void 0 : originModule.resource;
                if (!originRequest)
                    return;
                // We construct a "unique" key from origin module and request
                // It's not perfect unique, but that will be fine for us.
                // We also need to construct the same in the babel plugin.
                const key = `${path.relative(pagesDir, originRequest)} -> ${dependency.request}`;
                // Capture all files that need to be loaded.
                const files = new Set();
                if (manifest[key]) {
                    // In the "rare" case where multiple chunk groups
                    // are created for the same `import()` or multiple
                    // import()s reference the same module, we merge
                    // the files to make sure to not miss files
                    // This may cause overfetching in edge cases.
                    for (const file of manifest[key].files) {
                        files.add(file);
                    }
                }
                // There might not be a chunk group when all modules
                // are already loaded. In this case we only need need
                // the module id and no files
                if (chunkGroup) {
                    for (const chunk of chunkGroup
                        .chunks) {
                        chunk.files.forEach((file) => {
                            if ((file.endsWith('.js') || file.endsWith('.css')) &&
                                file.match(/^static\/(chunks|css)\//)) {
                                files.add(file);
                            }
                        });
                    }
                }
                // usually we have to add the parent chunk groups too
                // but we assume that all parents are also imported by
                // next/dynamic so they are loaded by the same technique
                // add the id and files to the manifest
                const id = dev ? key : getModuleId(compilation, module);
                manifest[key] = { id, files: Array.from(files) };
            }
        }
    };
    for (const module of compilation.modules) {
        module.blocks.forEach(handleBlock);
    }
    manifest = Object.keys(manifest)
        .sort()
        // eslint-disable-next-line no-sequences
        .reduce((a, c) => ((a[c] = manifest[c]), a), {});
    return manifest;
}
export class ReactLoadablePlugin {
    constructor(opts) {
        this.filename = opts.filename;
        this.pagesDir = opts.pagesDir;
        this.runtimeAsset = opts.runtimeAsset;
        this.dev = opts.dev;
    }
    createAssets(compiler, compilation, assets) {
        const manifest = buildManifest(compiler, compilation, this.pagesDir, this.dev);
        // @ts-ignore: TODO: remove when webpack 5 is stable
        assets[this.filename] = new sources.RawSource(JSON.stringify(manifest, null, 2));
        if (this.runtimeAsset) {
            assets[this.runtimeAsset] = new sources.RawSource(`self.__REACT_LOADABLE_MANIFEST=${JSON.stringify(JSON.stringify(manifest))}`);
        }
        return assets;
    }
    apply(compiler) {
        compiler.hooks.make.tap('ReactLoadableManifest', (compilation) => {
            compilation.hooks.processAssets.tap({
                name: 'ReactLoadableManifest',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
            }, (assets) => {
                this.createAssets(compiler, compilation, assets);
            });
        });
    }
}
