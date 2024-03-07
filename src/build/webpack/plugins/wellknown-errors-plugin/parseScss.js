import { bold, cyan, red, yellow } from '../../../../lib/picocolors';
import { SimpleWebpackError } from './simpleWebpackError';
const regexScssError = /SassError: (.+)\n\s+on line (\d+) [\s\S]*?>> (.+)\n\s*(-+)\^$/m;
export function getScssError(fileName, fileContent, err) {
    var _a;
    if (err.name !== 'SassError') {
        return false;
    }
    const res = regexScssError.exec(err.message);
    if (res) {
        const [, reason, _lineNumer, backupFrame, columnString] = res;
        const lineNumber = Math.max(1, parseInt(_lineNumer, 10));
        const column = (_a = columnString === null || columnString === void 0 ? void 0 : columnString.length) !== null && _a !== void 0 ? _a : 1;
        let frame;
        if (fileContent) {
            try {
                const { codeFrameColumns, } = require('next/dist/compiled/babel/code-frame');
                frame = codeFrameColumns(fileContent, { start: { line: lineNumber, column } }, { forceColor: true });
            }
            catch (_b) { }
        }
        return new SimpleWebpackError(`${cyan(fileName)}:${yellow(lineNumber.toString())}:${yellow(column.toString())}`, red(bold('Syntax error')).concat(`: ${reason}\n\n${frame !== null && frame !== void 0 ? frame : backupFrame}`));
    }
    return false;
}
