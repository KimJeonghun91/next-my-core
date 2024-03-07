import { cyan } from '../../../lib/picocolors';
import path from 'path';
const ErrorLoader = function () {
    var _a, _b, _c, _d, _e;
    // @ts-ignore exists
    const options = this.getOptions() || {};
    const { reason = 'An unknown error has occurred' } = options;
    // @ts-expect-error
    const resource = (_c = (_b = (_a = this._module) === null || _a === void 0 ? void 0 : _a.issuer) === null || _b === void 0 ? void 0 : _b.resource) !== null && _c !== void 0 ? _c : null;
    const context = (_d = this.rootContext) !== null && _d !== void 0 ? _d : (_e = this._compiler) === null || _e === void 0 ? void 0 : _e.context;
    const issuer = resource
        ? context
            ? path.relative(context, resource)
            : resource
        : null;
    const err = new Error(reason + (issuer ? `\nLocation: ${cyan(issuer)}` : ''));
    this.emitError(err);
};
export default ErrorLoader;
