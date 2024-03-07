import path from 'path';
import { DiagnosticCategory, getFormattedDiagnostic, } from './diagnosticFormatter';
import { getTypeScriptConfiguration } from './getTypeScriptConfiguration';
import { getRequiredConfiguration } from './writeConfigurationDefaults';
import { CompileError } from '../compile-error';
import { warn } from '../../build/output/log';
export async function runTypeCheck(ts, baseDir, distDir, tsConfigPath, cacheDir, isAppDirEnabled) {
    var _a;
    const effectiveConfiguration = await getTypeScriptConfiguration(ts, tsConfigPath);
    if (effectiveConfiguration.fileNames.length < 1) {
        return {
            hasWarnings: false,
            inputFilesCount: 0,
            totalFilesCount: 0,
            incremental: false,
        };
    }
    const requiredConfig = getRequiredConfiguration(ts);
    const options = Object.assign(Object.assign(Object.assign({}, requiredConfig), effectiveConfiguration.options), { declarationMap: false, emitDeclarationOnly: false, noEmit: true });
    let program;
    let incremental = false;
    if ((options.incremental || options.composite) && cacheDir) {
        if (options.composite) {
            warn('TypeScript project references are not fully supported. Attempting to build in incremental mode.');
        }
        incremental = true;
        program = ts.createIncrementalProgram({
            rootNames: effectiveConfiguration.fileNames,
            options: Object.assign(Object.assign({}, options), { composite: false, incremental: true, tsBuildInfoFile: path.join(cacheDir, '.tsbuildinfo') }),
        });
    }
    else {
        program = ts.createProgram(effectiveConfiguration.fileNames, options);
    }
    const result = program.emit();
    // Intended to match:
    // - pages/test.js
    // - pages/apples.test.js
    // - pages/__tests__/a.js
    //
    // But not:
    // - pages/contest.js
    // - pages/other.js
    // - pages/test/a.js
    //
    const regexIgnoredFile = /[\\/]__(?:tests|mocks)__[\\/]|(?<=[\\/.])(?:spec|test)\.[^\\/]+$/;
    const allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(result.diagnostics)
        .filter((d) => !(d.file && regexIgnoredFile.test(d.file.fileName)));
    const firstError = (_a = allDiagnostics.find((d) => d.category === DiagnosticCategory.Error && Boolean(d.file))) !== null && _a !== void 0 ? _a : allDiagnostics.find((d) => d.category === DiagnosticCategory.Error);
    // In test mode, we want to check all diagnostics, not just the first one.
    if (process.env.__NEXT_TEST_MODE) {
        if (firstError) {
            const allErrors = allDiagnostics
                .filter((d) => d.category === DiagnosticCategory.Error)
                .map((d) => '[Test Mode] ' +
                getFormattedDiagnostic(ts, baseDir, distDir, d, isAppDirEnabled));
            console.error('\n\n===== TS errors =====\n\n' +
                allErrors.join('\n\n') +
                '\n\n===== TS errors =====\n\n');
            // Make sure all stdout is flushed before we exit.
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
    if (firstError) {
        throw new CompileError(getFormattedDiagnostic(ts, baseDir, distDir, firstError, isAppDirEnabled));
    }
    const warnings = allDiagnostics
        .filter((d) => d.category === DiagnosticCategory.Warning)
        .map((d) => getFormattedDiagnostic(ts, baseDir, distDir, d, isAppDirEnabled));
    return {
        hasWarnings: true,
        warnings,
        inputFilesCount: effectiveConfiguration.fileNames.length,
        totalFilesCount: program.getSourceFiles().length,
        incremental,
    };
}
