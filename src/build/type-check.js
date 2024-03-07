import path from 'path';
import * as Log from './output/log';
import { Worker as JestWorker } from 'next/dist/compiled/jest-worker';
import { verifyAndLint } from '../lib/verifyAndLint';
import createSpinner from './spinner';
import { eventTypeCheckCompleted } from '../telemetry/events';
import isError from '../lib/is-error';
/**
 * typescript will be loaded in "next/lib/verify-typescript-setup" and
 * then passed to "next/lib/typescript/runTypeCheck" as a parameter.
 *
 * Since it is impossible to pass a function from main thread to a worker,
 * instead of running "next/lib/typescript/runTypeCheck" in a worker,
 * we will run entire "next/lib/verify-typescript-setup" in a worker instead.
 */
function verifyTypeScriptSetup(dir, distDir, intentDirs, typeCheckPreflight, tsconfigPath, disableStaticImages, cacheDir, enableWorkerThreads, hasAppDir, hasPagesDir) {
    const typeCheckWorker = new JestWorker(require.resolve('../lib/verify-typescript-setup'), {
        numWorkers: 1,
        enableWorkerThreads,
        maxRetries: 0,
    });
    typeCheckWorker.getStdout().pipe(process.stdout);
    typeCheckWorker.getStderr().pipe(process.stderr);
    return typeCheckWorker
        .verifyTypeScriptSetup({
        dir,
        distDir,
        intentDirs,
        typeCheckPreflight,
        tsconfigPath,
        disableStaticImages,
        cacheDir,
        hasAppDir,
        hasPagesDir,
    })
        .then((result) => {
        typeCheckWorker.end();
        return result;
    })
        .catch(() => {
        // The error is already logged in the worker, we simply exit the main thread to prevent the
        // `Jest worker encountered 1 child process exceptions, exceeding retry limit` from showing up
        process.exit(1);
    });
}
export async function startTypeChecking({ cacheDir, config, dir, ignoreESLint, nextBuildSpan, pagesDir, runLint, shouldLint, telemetry, appDir, }) {
    var _a, _b, _c;
    const ignoreTypeScriptErrors = Boolean(config.typescript.ignoreBuildErrors);
    const eslintCacheDir = path.join(cacheDir, 'eslint/');
    if (ignoreTypeScriptErrors) {
        Log.info('Skipping validation of types');
    }
    if (runLint && ignoreESLint) {
        // only print log when build require lint while ignoreESLint is enabled
        Log.info('Skipping linting');
    }
    let typeCheckingAndLintingSpinnerPrefixText;
    let typeCheckingAndLintingSpinner;
    if (!ignoreTypeScriptErrors && shouldLint) {
        typeCheckingAndLintingSpinnerPrefixText =
            'Linting and checking validity of types';
    }
    else if (!ignoreTypeScriptErrors) {
        typeCheckingAndLintingSpinnerPrefixText = 'Checking validity of types';
    }
    else if (shouldLint) {
        typeCheckingAndLintingSpinnerPrefixText = 'Linting';
    }
    // we will not create a spinner if both ignoreTypeScriptErrors and ignoreESLint are
    // enabled, but we will still verifying project's tsconfig and dependencies.
    if (typeCheckingAndLintingSpinnerPrefixText) {
        typeCheckingAndLintingSpinner = createSpinner(typeCheckingAndLintingSpinnerPrefixText);
    }
    const typeCheckStart = process.hrtime();
    try {
        const [[verifyResult, typeCheckEnd]] = await Promise.all([
            nextBuildSpan.traceChild('verify-typescript-setup').traceAsyncFn(() => verifyTypeScriptSetup(dir, config.distDir, [pagesDir, appDir].filter(Boolean), !ignoreTypeScriptErrors, config.typescript.tsconfigPath, config.images.disableStaticImages, cacheDir, config.experimental.workerThreads, !!appDir, !!pagesDir).then((resolved) => {
                const checkEnd = process.hrtime(typeCheckStart);
                return [resolved, checkEnd];
            })),
            shouldLint &&
                nextBuildSpan.traceChild('verify-and-lint').traceAsyncFn(async () => {
                    var _a;
                    await verifyAndLint(dir, eslintCacheDir, (_a = config.eslint) === null || _a === void 0 ? void 0 : _a.dirs, config.experimental.workerThreads, telemetry);
                }),
        ]);
        typeCheckingAndLintingSpinner === null || typeCheckingAndLintingSpinner === void 0 ? void 0 : typeCheckingAndLintingSpinner.stopAndPersist();
        if (!ignoreTypeScriptErrors && verifyResult) {
            telemetry.record(eventTypeCheckCompleted({
                durationInSeconds: typeCheckEnd[0],
                typescriptVersion: verifyResult.version,
                inputFilesCount: (_a = verifyResult.result) === null || _a === void 0 ? void 0 : _a.inputFilesCount,
                totalFilesCount: (_b = verifyResult.result) === null || _b === void 0 ? void 0 : _b.totalFilesCount,
                incremental: (_c = verifyResult.result) === null || _c === void 0 ? void 0 : _c.incremental,
            }));
        }
    }
    catch (err) {
        // prevent showing jest-worker internal error as it
        // isn't helpful for users and clutters output
        if (isError(err) && err.message === 'Call retries were exceeded') {
            await telemetry.flush();
            process.exit(1);
        }
        throw err;
    }
}
