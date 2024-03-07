/**
 * Get external stylesheet link hrefs based on server CSS manifest.
 */
export function getLinkAndScriptTags(clientReferenceManifest, filePath, injectedCSS, injectedScripts, collectNewImports) {
    var _a, _b;
    const filePathWithoutExt = filePath.replace(/\.[^.]+$/, '');
    const cssChunks = new Set();
    const jsChunks = new Set();
    const entryCSSFiles = clientReferenceManifest.entryCSSFiles[filePathWithoutExt];
    const entryJSFiles = (_b = (_a = clientReferenceManifest.entryJSFiles) === null || _a === void 0 ? void 0 : _a[filePathWithoutExt]) !== null && _b !== void 0 ? _b : [];
    if (entryCSSFiles) {
        for (const file of entryCSSFiles) {
            if (!injectedCSS.has(file)) {
                if (collectNewImports) {
                    injectedCSS.add(file);
                }
                cssChunks.add(file);
            }
        }
    }
    if (entryJSFiles) {
        for (const file of entryJSFiles) {
            if (!injectedScripts.has(file)) {
                if (collectNewImports) {
                    injectedScripts.add(file);
                }
                jsChunks.add(file);
            }
        }
    }
    return { styles: [...cssChunks], scripts: [...jsChunks] };
}
