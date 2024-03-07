import terser from 'next/dist/compiled/terser';
function buildTerserOptions(terserOptions = {}) {
    return Object.assign(Object.assign(Object.assign({}, terserOptions), { mangle: terserOptions.mangle == null
            ? true
            : typeof terserOptions.mangle === 'boolean'
                ? terserOptions.mangle
                : Object.assign({}, terserOptions.mangle), 
        // Ignoring sourceMap from options
        // eslint-disable-next-line no-undefined
        sourceMap: undefined }), (terserOptions.format
        ? { format: Object.assign({ beautify: false }, terserOptions.format) }
        : { output: Object.assign({ beautify: false }, terserOptions.output) }));
}
export async function minify(options) {
    const { name, input, inputSourceMap, terserOptions } = options;
    // Copy terser options
    const opts = buildTerserOptions(terserOptions);
    // Let terser generate a SourceMap
    if (inputSourceMap) {
        // @ts-ignore
        opts.sourceMap = { asObject: true };
    }
    const result = await terser.minify({ [name]: input }, opts);
    return result;
}
