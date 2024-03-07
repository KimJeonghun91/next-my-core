export default function NextPageDisallowReExportAllExports() {
    return {
        visitor: {
            ImportDeclaration(path) {
                var _a, _b, _c, _d;
                if ([
                    '@next/font/local',
                    '@next/font/google',
                    'next/font/local',
                    'next/font/google',
                ].includes(path.node.source.value)) {
                    const err = new SyntaxError(`"next/font" requires SWC although Babel is being used due to a custom babel config being present.\nRead more: https://nextjs.org/docs/messages/babel-font-loader-conflict`);
                    err.code = 'BABEL_PARSE_ERROR';
                    err.loc =
                        (_d = (_b = (_a = path.node.loc) === null || _a === void 0 ? void 0 : _a.start) !== null && _b !== void 0 ? _b : (_c = path.node.loc) === null || _c === void 0 ? void 0 : _c.end) !== null && _d !== void 0 ? _d : path.node.loc;
                    throw err;
                }
            },
        },
    };
}
