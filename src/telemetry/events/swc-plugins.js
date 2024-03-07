import findUp from 'next/dist/compiled/find-up';
import path from 'path';
import fs from 'fs';
const EVENT_SWC_PLUGIN_PRESENT = 'NEXT_SWC_PLUGIN_DETECTED';
export async function eventSwcPlugins(dir, config) {
    var _a, _b, _c;
    try {
        const packageJsonPath = await findUp('package.json', { cwd: dir });
        if (!packageJsonPath) {
            return [];
        }
        const { dependencies = {}, devDependencies = {} } = require(packageJsonPath);
        const deps = Object.assign(Object.assign({}, devDependencies), dependencies);
        const swcPluginPackages = (_c = (_b = (_a = config.experimental) === null || _a === void 0 ? void 0 : _a.swcPlugins) === null || _b === void 0 ? void 0 : _b.map(([name, _]) => name)) !== null && _c !== void 0 ? _c : [];
        return swcPluginPackages.map((plugin) => {
            var _a;
            // swc plugins can be non-npm pkgs with absolute path doesn't have version
            const version = (_a = deps[plugin]) !== null && _a !== void 0 ? _a : undefined;
            let pluginName = plugin;
            if (fs.existsSync(pluginName)) {
                pluginName = path.basename(plugin, '.wasm');
            }
            return {
                eventName: EVENT_SWC_PLUGIN_PRESENT,
                payload: {
                    pluginName: pluginName,
                    pluginVersion: version,
                },
            };
        });
    }
    catch (_) {
        return [];
    }
}
