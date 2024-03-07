import { randomBytes } from 'crypto';
import { traceGlobals } from '../shared';
import fs from 'fs';
import path from 'path';
import { PHASE_DEVELOPMENT_SERVER } from '../../shared/lib/constants';
const localEndpoint = {
    serviceName: 'nextjs',
    ipv4: '127.0.0.1',
    port: 9411,
};
// Batch events as zipkin allows for multiple events to be sent in one go
export function batcher(reportEvents) {
    const events = [];
    // Promise queue to ensure events are always sent on flushAll
    const queue = new Set();
    return {
        flushAll: async () => {
            await Promise.all(queue);
            if (events.length > 0) {
                await reportEvents(events);
                events.length = 0;
            }
        },
        report: (event) => {
            events.push(event);
            if (events.length > 100) {
                const evts = events.slice();
                events.length = 0;
                const report = reportEvents(evts);
                queue.add(report);
                report.then(() => queue.delete(report));
            }
        },
    };
}
let writeStream;
let traceId;
let batch;
const writeStreamOptions = {
    flags: 'a',
    encoding: 'utf8',
};
class RotatingWriteStream {
    constructor(file, sizeLimit) {
        this.file = file;
        this.size = 0;
        this.sizeLimit = sizeLimit;
        this.createWriteStream();
    }
    createWriteStream() {
        this.writeStream = fs.createWriteStream(this.file, writeStreamOptions);
    }
    // Recreate the file
    async rotate() {
        await this.end();
        try {
            fs.unlinkSync(this.file);
        }
        catch (err) {
            // It's fine if the file does not exist yet
            if (err.code !== 'ENOENT') {
                throw err;
            }
        }
        this.size = 0;
        this.createWriteStream();
        this.rotatePromise = undefined;
    }
    async write(data) {
        if (this.rotatePromise)
            await this.rotatePromise;
        this.size += data.length;
        if (this.size > this.sizeLimit) {
            await (this.rotatePromise = this.rotate());
        }
        if (!this.writeStream.write(data, 'utf8')) {
            if (this.drainPromise === undefined) {
                this.drainPromise = new Promise((resolve, _reject) => {
                    this.writeStream.once('drain', () => {
                        this.drainPromise = undefined;
                        resolve();
                    });
                });
            }
            await this.drainPromise;
        }
    }
    end() {
        return new Promise((resolve) => {
            this.writeStream.end(resolve);
        });
    }
}
const reportToLocalHost = (event) => {
    const distDir = traceGlobals.get('distDir');
    const phase = traceGlobals.get('phase');
    if (!distDir || !phase) {
        return;
    }
    if (!traceId) {
        traceId = process.env.TRACE_ID || randomBytes(8).toString('hex');
    }
    if (!batch) {
        batch = batcher(async (events) => {
            if (!writeStream) {
                await fs.promises.mkdir(distDir, { recursive: true });
                const file = path.join(distDir, 'trace');
                writeStream = new RotatingWriteStream(file, 
                // Development is limited to 50MB, production is unlimited
                phase === PHASE_DEVELOPMENT_SERVER ? 52428800 : Infinity);
            }
            const eventsJson = JSON.stringify(events);
            try {
                await writeStream.write(eventsJson + '\n');
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    batch.report(Object.assign(Object.assign({}, event), { traceId }));
};
export default {
    flushAll: () => batch
        ? batch.flushAll().then(() => {
            const phase = traceGlobals.get('phase');
            // Only end writeStream when manually flushing in production
            if (phase !== PHASE_DEVELOPMENT_SERVER) {
                return writeStream.end();
            }
        })
        : undefined,
    report: reportToLocalHost,
};
