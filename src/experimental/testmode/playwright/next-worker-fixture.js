import { createProxyServer } from '../proxy';
class NextWorkerFixtureImpl {
    constructor() {
        this.proxyPort = 0;
        this.proxyServer = null;
        this.proxyFetchMap = new Map();
    }
    async setup() {
        const server = await createProxyServer({
            onFetch: this.handleProxyFetch.bind(this),
        });
        this.proxyPort = server.port;
        this.proxyServer = server;
    }
    teardown() {
        if (this.proxyServer) {
            this.proxyServer.close();
            this.proxyServer = null;
        }
    }
    cleanupTest(testId) {
        this.proxyFetchMap.delete(testId);
    }
    onFetch(testId, handler) {
        this.proxyFetchMap.set(testId, handler);
    }
    async handleProxyFetch(testId, request) {
        const handler = this.proxyFetchMap.get(testId);
        return handler === null || handler === void 0 ? void 0 : handler(request);
    }
}
export async function applyNextWorkerFixture(use) {
    const fixture = new NextWorkerFixtureImpl();
    await fixture.setup();
    await use(fixture);
    fixture.teardown();
}
