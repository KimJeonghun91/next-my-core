import { getModuleBuildError } from './webpackModuleError';
const NAME = 'WellKnownErrorsPlugin';
export class WellKnownErrorsPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap(NAME, (compilation) => {
            compilation.hooks.afterSeal.tapPromise(NAME, async () => {
                var _a, _b;
                if ((_a = compilation.warnings) === null || _a === void 0 ? void 0 : _a.length) {
                    await Promise.all(compilation.warnings.map(async (warn, i) => {
                        var _a;
                        if (warn.name === 'ModuleDependencyWarning' &&
                            ((_a = warn.module.context) === null || _a === void 0 ? void 0 : _a.includes('node_modules'))) {
                            compilation.warnings.splice(i, 1);
                        }
                    }));
                }
                if ((_b = compilation.errors) === null || _b === void 0 ? void 0 : _b.length) {
                    await Promise.all(compilation.errors.map(async (err, i) => {
                        try {
                            const moduleError = await getModuleBuildError(compiler, compilation, err);
                            if (moduleError !== false) {
                                compilation.errors[i] = moduleError;
                            }
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }));
                }
            });
        });
    }
}
