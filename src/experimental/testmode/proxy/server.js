var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import http from 'http';
import { UNHANDLED } from './types';
import { handleFetch } from './fetch-api';
async function readBody(req) {
    var _a, e_1, _b, _c;
    const acc = [];
    try {
        for (var _d = true, req_1 = __asyncValues(req), req_1_1; req_1_1 = await req_1.next(), _a = req_1_1.done, !_a; _d = true) {
            _c = req_1_1.value;
            _d = false;
            const chunk = _c;
            acc.push(chunk);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = req_1.return)) await _b.call(req_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Buffer.concat(acc);
}
export async function createProxyServer({ onFetch, }) {
    const server = http.createServer(async (req, res) => {
        if (req.url !== '/') {
            res.writeHead(404);
            res.end();
            return;
        }
        let json;
        try {
            json = JSON.parse((await readBody(req)).toString('utf-8'));
        }
        catch (e) {
            res.writeHead(400);
            res.end();
            return;
        }
        const { api } = json;
        let response;
        switch (api) {
            case 'fetch':
                if (onFetch) {
                    response = await handleFetch(json, onFetch);
                }
                break;
            default:
                break;
        }
        if (!response) {
            response = UNHANDLED;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(response));
        res.end();
    });
    await new Promise((resolve) => {
        server.listen(0, 'localhost', () => {
            resolve(undefined);
        });
    });
    const address = server.address();
    if (!address || typeof address !== 'object') {
        server.close();
        throw new Error('Failed to create a proxy server');
    }
    const port = address.port;
    const fetchWith = (input, init, testData) => {
        const request = new Request(input, init);
        request.headers.set('Next-Test-Proxy-Port', String(port));
        request.headers.set('Next-Test-Data', testData !== null && testData !== void 0 ? testData : '');
        return fetch(request);
    };
    return { port, close: () => server.close(), fetchWith };
}
