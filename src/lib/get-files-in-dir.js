var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { join } from 'path';
import fs from 'fs/promises';
export async function getFilesInDir(path) {
    var _a, e_1, _b, _c;
    const dir = await fs.opendir(path);
    const results = [];
    try {
        for (var _d = true, dir_1 = __asyncValues(dir), dir_1_1; dir_1_1 = await dir_1.next(), _a = dir_1_1.done, !_a; _d = true) {
            _c = dir_1_1.value;
            _d = false;
            const file = _c;
            let resolvedFile = file;
            if (file.isSymbolicLink()) {
                resolvedFile = await fs.stat(join(path, file.name));
            }
            if (resolvedFile.isFile()) {
                results.push(file.name);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = dir_1.return)) await _b.call(dir_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return results;
}
