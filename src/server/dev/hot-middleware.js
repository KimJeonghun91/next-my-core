// Based on https://github.com/webpack-contrib/webpack-hot-middleware/blob/9708d781ae0e46179cf8ea1a94719de4679aaf53/middleware.js
// Included License below
import { isMiddlewareFilename } from '../../build/utils';
import { HMR_ACTIONS_SENT_TO_BROWSER } from './hot-reloader-types';
function isMiddlewareStats(stats) {
    for (const key of stats.compilation.entrypoints.keys()) {
        if (isMiddlewareFilename(key)) {
            return true;
        }
    }
    return false;
}
function statsToJson(stats) {
    if (!stats)
        return {};
    return stats.toJson({
        all: false,
        errors: true,
        hash: true,
        warnings: true,
    });
}
function getStatsForSyncEvent(clientStats, serverStats) {
    if (!clientStats)
        return serverStats === null || serverStats === void 0 ? void 0 : serverStats.stats;
    if (!serverStats)
        return clientStats === null || clientStats === void 0 ? void 0 : clientStats.stats;
    // Prefer the server compiler stats if it has errors.
    // Otherwise we may end up in a state where the client compilation is the latest but without errors.
    // This causes the error overlay to not display the build error.
    if (serverStats.stats.hasErrors()) {
        return serverStats.stats;
    }
    // Return the latest stats
    return serverStats.ts > clientStats.ts ? serverStats.stats : clientStats.stats;
}
class EventStream {
    constructor() {
        this.clients = new Set();
    }
    everyClient(fn) {
        for (const client of this.clients) {
            fn(client);
        }
    }
    close() {
        this.everyClient((client) => {
            client.close();
        });
        this.clients.clear();
    }
    handler(client) {
        this.clients.add(client);
        client.addEventListener('close', () => {
            this.clients.delete(client);
        });
    }
    publish(payload) {
        this.everyClient((client) => {
            client.send(JSON.stringify(payload));
        });
    }
}
export class WebpackHotMiddleware {
    constructor(compilers, versionInfo) {
        this.onClientInvalid = () => {
            var _a;
            if (this.closed || ((_a = this.serverLatestStats) === null || _a === void 0 ? void 0 : _a.stats.hasErrors()))
                return;
            this.publish({
                action: HMR_ACTIONS_SENT_TO_BROWSER.BUILDING,
            });
        };
        this.onClientDone = (statsResult) => {
            var _a;
            this.clientLatestStats = { ts: Date.now(), stats: statsResult };
            if (this.closed || ((_a = this.serverLatestStats) === null || _a === void 0 ? void 0 : _a.stats.hasErrors()))
                return;
            this.publishStats(statsResult);
        };
        this.onServerInvalid = () => {
            var _a, _b;
            if (!((_a = this.serverLatestStats) === null || _a === void 0 ? void 0 : _a.stats.hasErrors()))
                return;
            this.serverLatestStats = null;
            if ((_b = this.clientLatestStats) === null || _b === void 0 ? void 0 : _b.stats) {
                this.publishStats(this.clientLatestStats.stats);
            }
        };
        this.onServerDone = (statsResult) => {
            if (this.closed)
                return;
            if (statsResult.hasErrors()) {
                this.serverLatestStats = { ts: Date.now(), stats: statsResult };
                this.publishStats(statsResult);
            }
        };
        this.onEdgeServerInvalid = () => {
            var _a, _b;
            if (!((_a = this.middlewareLatestStats) === null || _a === void 0 ? void 0 : _a.stats.hasErrors()))
                return;
            this.middlewareLatestStats = null;
            if ((_b = this.clientLatestStats) === null || _b === void 0 ? void 0 : _b.stats) {
                this.publishStats(this.clientLatestStats.stats);
            }
        };
        this.onEdgeServerDone = (statsResult) => {
            if (!isMiddlewareStats(statsResult)) {
                this.onServerDone(statsResult);
                return;
            }
            if (statsResult.hasErrors()) {
                this.middlewareLatestStats = { ts: Date.now(), stats: statsResult };
                this.publishStats(statsResult);
            }
        };
        /**
         * To sync we use the most recent stats but also we append middleware
         * errors. This is because it is possible that middleware fails to compile
         * and we still want to show the client overlay with the error while
         * the error page should be rendered just fine.
         */
        this.onHMR = (client) => {
            var _a;
            if (this.closed)
                return;
            this.eventStream.handler(client);
            const syncStats = getStatsForSyncEvent(this.clientLatestStats, this.serverLatestStats);
            if (syncStats) {
                const stats = statsToJson(syncStats);
                const middlewareStats = statsToJson((_a = this.middlewareLatestStats) === null || _a === void 0 ? void 0 : _a.stats);
                this.publish({
                    action: HMR_ACTIONS_SENT_TO_BROWSER.SYNC,
                    hash: stats.hash,
                    errors: [...(stats.errors || []), ...(middlewareStats.errors || [])],
                    warnings: [
                        ...(stats.warnings || []),
                        ...(middlewareStats.warnings || []),
                    ],
                    versionInfo: this.versionInfo,
                });
            }
        };
        this.publishStats = (statsResult) => {
            const stats = statsResult.toJson({
                all: false,
                hash: true,
                warnings: true,
                errors: true,
                moduleTrace: true,
            });
            this.publish({
                action: HMR_ACTIONS_SENT_TO_BROWSER.BUILT,
                hash: stats.hash,
                warnings: stats.warnings || [],
                errors: stats.errors || [],
            });
        };
        this.publish = (payload) => {
            if (this.closed)
                return;
            this.eventStream.publish(payload);
        };
        this.close = () => {
            if (this.closed)
                return;
            // Can't remove compiler plugins, so we just set a flag and noop if closed
            // https://github.com/webpack/tapable/issues/32#issuecomment-350644466
            this.closed = true;
            this.eventStream.close();
        };
        this.eventStream = new EventStream();
        this.clientLatestStats = null;
        this.middlewareLatestStats = null;
        this.serverLatestStats = null;
        this.closed = false;
        this.versionInfo = versionInfo;
        compilers[0].hooks.invalid.tap('webpack-hot-middleware', this.onClientInvalid);
        compilers[0].hooks.done.tap('webpack-hot-middleware', this.onClientDone);
        compilers[1].hooks.invalid.tap('webpack-hot-middleware', this.onServerInvalid);
        compilers[1].hooks.done.tap('webpack-hot-middleware', this.onServerDone);
        compilers[2].hooks.done.tap('webpack-hot-middleware', this.onEdgeServerDone);
        compilers[2].hooks.invalid.tap('webpack-hot-middleware', this.onEdgeServerInvalid);
    }
}
