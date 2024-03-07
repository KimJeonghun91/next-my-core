import { traceGlobals } from '../shared';
const TRACE_EVENT_ACCESSLIST = new Map(Object.entries({
    'webpack-invalidated': 'WEBPACK_INVALIDATED',
}));
const reportToTelemetry = ({ name, duration }) => {
    const eventName = TRACE_EVENT_ACCESSLIST.get(name);
    if (!eventName) {
        return;
    }
    const telemetry = traceGlobals.get('telemetry');
    if (!telemetry) {
        return;
    }
    telemetry.record({
        eventName,
        payload: {
            durationInMicroseconds: duration,
        },
    });
};
export default {
    flushAll: () => { },
    report: reportToTelemetry,
};
