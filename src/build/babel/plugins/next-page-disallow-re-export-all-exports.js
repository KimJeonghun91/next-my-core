export default function NextPageDisallowReExportAllExports() {
    return {
        visitor: {
            ExportAllDeclaration(path) {
                var _a, _b, _c, _d;
                const err = new SyntaxError(`Using \`export * from '...'\` in a page is disallowed. Please use \`export { default } from '...'\` instead.\n` +
                    `Read more: https://nextjs.org/docs/messages/export-all-in-page`);
                err.code = 'BABEL_PARSE_ERROR';
                err.loc =
                    (_d = (_b = (_a = path.node.loc) === null || _a === void 0 ? void 0 : _a.start) !== null && _b !== void 0 ? _b : (_c = path.node.loc) === null || _c === void 0 ? void 0 : _c.end) !== null && _d !== void 0 ? _d : path.node.loc;
                throw err;
            },
        },
    };
}
