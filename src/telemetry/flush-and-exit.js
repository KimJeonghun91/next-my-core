import { traceGlobals } from '../trace/shared';
export async function flushAndExit(code) {
    let telemetry = traceGlobals.get('telemetry');
    if (telemetry) {
        await telemetry.flush();
    }
    process.exit(code);
}
