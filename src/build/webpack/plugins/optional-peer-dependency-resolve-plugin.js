const pluginSymbol = Symbol('OptionalPeerDependencyResolverPlugin');
export class OptionalPeerDependencyResolverPlugin {
    apply(resolver) {
        const target = resolver.ensureHook('raw-module');
        target.tapAsync('OptionalPeerDependencyResolverPlugin', (request, resolveContext, callback) => {
            var _a;
            // if we've already recursed into this plugin, we want to skip it
            if (request[pluginSymbol]) {
                return callback();
            }
            // popping the stack to prevent the recursion check
            (_a = resolveContext.stack) === null || _a === void 0 ? void 0 : _a.delete(Array.from(resolveContext.stack).pop());
            resolver.doResolve(target, 
            // when we call doResolve again, we need to make sure we don't
            // recurse into this plugin again
            Object.assign(Object.assign({}, request), { [pluginSymbol]: true }), null, resolveContext, (err, result) => {
                var _a;
                if (!result &&
                    ((_a = request === null || request === void 0 ? void 0 : request.descriptionFileData) === null || _a === void 0 ? void 0 : _a.peerDependenciesMeta) &&
                    request.request) {
                    const peerDependenciesMeta = request.descriptionFileData
                        .peerDependenciesMeta;
                    const isOptional = peerDependenciesMeta &&
                        peerDependenciesMeta[request.request] &&
                        peerDependenciesMeta[request.request].optional;
                    if (isOptional) {
                        return callback(null, {
                            path: false,
                        });
                    }
                }
                return callback(err, result);
            });
        });
    }
}
