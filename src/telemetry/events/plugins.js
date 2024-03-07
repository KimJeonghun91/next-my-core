import findUp from 'next/dist/compiled/find-up';
const EVENT_PLUGIN_PRESENT = 'NEXT_PACKAGE_DETECTED';
export async function eventNextPlugins(dir) {
    try {
        const packageJsonPath = await findUp('package.json', { cwd: dir });
        if (!packageJsonPath) {
            return [];
        }
        const { dependencies = {}, devDependencies = {} } = require(packageJsonPath);
        const deps = Object.assign(Object.assign({}, devDependencies), dependencies);
        return Object.keys(deps).reduce((events, plugin) => {
            const version = deps[plugin];
            // Don't add deps without a version set
            if (!version) {
                return events;
            }
            events.push({
                eventName: EVENT_PLUGIN_PRESENT,
                payload: {
                    packageName: plugin,
                    packageVersion: version,
                },
            });
            return events;
        }, []);
    }
    catch (_) {
        return [];
    }
}
