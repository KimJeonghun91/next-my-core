var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import findUp from 'next/dist/compiled/find-up';
import fsPromise from 'fs/promises';
import child_process from 'child_process';
import assert from 'assert';
import fetch from 'next/dist/compiled/node-fetch';
import os from 'os';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';
import path from 'path';
import { Telemetry } from '../telemetry/storage';
// Predefined set of the event names to be included in the trace.
// If the trace span's name matches to one of the event names in the set,
// it'll up uploaded to the trace server.
const EVENT_FILTER = new Set([
    'client-hmr-latency',
    'hot-reloader',
    'webpack-invalid-client',
    'webpack-invalidated-server',
    'navigation-to-hydration',
    'start-dev-server',
    'compile-path',
    'memory-usage',
    'server-restart-close-to-memory-threshold',
]);
const { NEXT_TRACE_UPLOAD_DEBUG, 
// An external env to allow to upload full trace without picking up the relavant spans.
// This is mainly for the debugging purpose, to allwo manual audit for full trace for the given build.
// [NOTE] This may fail if build is large and generated trace is excessively large.
NEXT_TRACE_UPLOAD_FULL, } = process.env;
const isDebugEnabled = !!NEXT_TRACE_UPLOAD_DEBUG || !!NEXT_TRACE_UPLOAD_FULL;
const shouldUploadFullTrace = !!NEXT_TRACE_UPLOAD_FULL;
const [, , traceUploadUrl, mode, projectDir, distDir] = process.argv;
;
(async function upload() {
    var _a, e_1, _b, _c;
    const nextVersion = JSON.parse(await fsPromise.readFile(path.resolve(__dirname, '../../package.json'), 'utf8')).version;
    const telemetry = new Telemetry({ distDir });
    const projectPkgJsonPath = await findUp('package.json');
    assert(projectPkgJsonPath);
    const projectPkgJson = JSON.parse(await fsPromise.readFile(projectPkgJsonPath, 'utf-8'));
    const pkgName = projectPkgJson.name;
    const commit = child_process
        .spawnSync(os.platform() === 'win32' ? 'git.exe' : 'git', ['rev-parse', 'HEAD'], { shell: true })
        .stdout.toString()
        .trimEnd();
    const readLineInterface = createInterface({
        input: createReadStream(path.join(projectDir, distDir, 'trace')),
        crlfDelay: Infinity,
    });
    let isTurboSession = false;
    const traces = new Map();
    try {
        for (var _d = true, readLineInterface_1 = __asyncValues(readLineInterface), readLineInterface_1_1; readLineInterface_1_1 = await readLineInterface_1.next(), _a = readLineInterface_1_1.done, !_a; _d = true) {
            _c = readLineInterface_1_1.value;
            _d = false;
            const line = _c;
            const lineEvents = JSON.parse(line);
            for (const event of lineEvents) {
                if (
                // Always include root spans
                event.parentId === undefined ||
                    shouldUploadFullTrace ||
                    EVENT_FILTER.has(event.name)) {
                    let trace = traces.get(event.traceId);
                    if (trace === undefined) {
                        trace = [];
                        traces.set(event.traceId, trace);
                    }
                    if (typeof event.tags.isTurbopack === 'boolean') {
                        isTurboSession = event.tags.isTurbopack;
                    }
                    trace.push(event);
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = readLineInterface_1.return)) await _b.call(readLineInterface_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    const body = {
        metadata: {
            anonymousId: telemetry.anonymousId,
            arch: os.arch(),
            commit,
            cpus: os.cpus().length,
            isTurboSession,
            mode,
            nextVersion,
            pkgName,
            platform: os.platform(),
            sessionId: telemetry.sessionId,
        },
        traces: [...traces.values()],
    };
    if (isDebugEnabled) {
        console.log('Sending request with body', JSON.stringify(body, null, 2));
    }
    let res = await fetch(traceUploadUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-trace-transfer-mode': shouldUploadFullTrace ? 'full' : 'default',
        },
        body: JSON.stringify(body),
    });
    if (isDebugEnabled) {
        console.log('Received response', res.status, await res.json());
    }
})();
