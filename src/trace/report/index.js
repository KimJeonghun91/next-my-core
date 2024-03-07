import reportToTelemetry from './to-telemetry';
import reportToJson from './to-json';
class MultiReporter {
    constructor(reporters) {
        this.reporters = [];
        this.reporters = reporters;
    }
    async flushAll() {
        await Promise.all(this.reporters.map((reporter) => reporter.flushAll()));
    }
    report(event) {
        this.reporters.forEach((reporter) => reporter.report(event));
    }
}
// JSON is always reported to allow for diagnostics
export const reporter = new MultiReporter([reportToJson, reportToTelemetry]);
