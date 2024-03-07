var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as Log from '../output/log';
import { NextBuildContext } from '../build-context';
import { Worker } from 'next/dist/compiled/jest-worker';
import origDebug from 'next/dist/compiled/debug';
import path from 'path';
import { exportTraceState, recordTraceEvents } from '../../trace';
const debug = origDebug('next:build:webpack-build');
const ORDERED_COMPILER_NAMES = [
    'server',
    'edge-server',
    'client',
];
let pluginState = {};
function deepMerge(target, source) {
    const result = Object.assign(Object.assign({}, target), source);
    for (const key of Object.keys(result)) {
        result[key] = Array.isArray(target[key])
            ? (target[key] = [...target[key], ...(source[key] || [])])
            : typeof target[key] == 'object' && typeof source[key] == 'object'
                ? deepMerge(target[key], source[key])
                : result[key];
    }
    return result;
}
async function webpackBuildWithWorker(compilerNamesArg) {
    var _a, _b;
    const compilerNames = compilerNamesArg || ORDERED_COMPILER_NAMES;
    const { nextBuildSpan } = NextBuildContext, prunedBuildContext = __rest(NextBuildContext, ["nextBuildSpan"]);
    prunedBuildContext.pluginState = pluginState;
    const getWorker = (compilerName) => {
        var _a;
        const _worker = new Worker(path.join(__dirname, 'impl.js'), {
            exposedMethods: ['workerMain'],
            numWorkers: 1,
            maxRetries: 0,
            forkOptions: {
                env: Object.assign(Object.assign({}, process.env), { NEXT_PRIVATE_BUILD_WORKER: '1' }),
            },
        });
        _worker.getStderr().pipe(process.stderr);
        _worker.getStdout().pipe(process.stdout);
        for (const worker of (((_a = _worker._workerPool) === null || _a === void 0 ? void 0 : _a._workers) || [])) {
            worker._child.on('exit', (code, signal) => {
                if (code || (signal && signal !== 'SIGINT')) {
                    console.error(`Compiler ${compilerName} unexpectedly exited with code: ${code} and signal: ${signal}`);
                }
            });
        }
        return _worker;
    };
    const combinedResult = {
        duration: 0,
        buildTraceContext: {},
    };
    for (const compilerName of compilerNames) {
        const worker = getWorker(compilerName);
        const curResult = await worker.workerMain({
            buildContext: prunedBuildContext,
            compilerName,
            traceState: Object.assign(Object.assign({}, exportTraceState()), { defaultParentSpanId: nextBuildSpan === null || nextBuildSpan === void 0 ? void 0 : nextBuildSpan.getId(), shouldSaveTraceEvents: true }),
        });
        if (nextBuildSpan && curResult.debugTraceEvents) {
            recordTraceEvents(curResult.debugTraceEvents);
        }
        // destroy worker so it's not sticking around using memory
        await worker.end();
        // Update plugin state
        pluginState = deepMerge(pluginState, curResult.pluginState);
        prunedBuildContext.pluginState = pluginState;
        if (curResult.telemetryState) {
            NextBuildContext.telemetryState = curResult.telemetryState;
        }
        combinedResult.duration += curResult.duration;
        if ((_a = curResult.buildTraceContext) === null || _a === void 0 ? void 0 : _a.entriesTrace) {
            const { entryNameMap } = curResult.buildTraceContext.entriesTrace;
            if (entryNameMap) {
                combinedResult.buildTraceContext.entriesTrace =
                    curResult.buildTraceContext.entriesTrace;
                combinedResult.buildTraceContext.entriesTrace.entryNameMap =
                    entryNameMap;
            }
            if ((_b = curResult.buildTraceContext) === null || _b === void 0 ? void 0 : _b.chunksTrace) {
                const { entryNameFilesMap } = curResult.buildTraceContext.chunksTrace;
                if (entryNameFilesMap) {
                    combinedResult.buildTraceContext.chunksTrace =
                        curResult.buildTraceContext.chunksTrace;
                    combinedResult.buildTraceContext.chunksTrace.entryNameFilesMap =
                        entryNameFilesMap;
                }
            }
        }
    }
    if (compilerNames.length === 3) {
        Log.event('Compiled successfully');
    }
    return combinedResult;
}
export function webpackBuild(withWorker, compilerNames) {
    if (withWorker) {
        debug('using separate compiler workers');
        return webpackBuildWithWorker(compilerNames);
    }
    else {
        debug('building all compilers in same process');
        const webpackBuildImpl = require('./impl').webpackBuildImpl;
        return webpackBuildImpl(null, null);
    }
}
