const EVENT_VERSION = 'NEXT_CLI_SESSION_STOPPED';
export function eventCliSessionStopped(event) {
    // This should be an invariant, if it fails our build tooling is broken.
    if (typeof process.env.__NEXT_VERSION !== 'string') {
        return [];
    }
    const payload = Object.assign(Object.assign({ nextVersion: process.env.__NEXT_VERSION, nodeVersion: process.version, cliCommand: event.cliCommand, durationMilliseconds: event.durationMilliseconds }, (typeof event.turboFlag !== 'undefined'
        ? {
            turboFlag: !!event.turboFlag,
        }
        : {})), { pagesDir: event.pagesDir, appDir: event.appDir });
    return [{ eventName: EVENT_VERSION, payload }];
}
