import { handleRoute } from './page-route';
import { reportFetch } from './report';
class NextFixtureImpl {
    constructor(testInfo, options, worker, page) {
        this.testInfo = testInfo;
        this.options = options;
        this.worker = worker;
        this.page = page;
        this.fetchHandlers = [];
        this.testId = testInfo.testId;
        const testHeaders = {
            'Next-Test-Proxy-Port': String(worker.proxyPort),
            'Next-Test-Data': this.testId,
        };
        const handleFetch = this.handleFetch.bind(this);
        worker.onFetch(this.testId, handleFetch);
        this.page.route('**', (route) => handleRoute(route, page, testHeaders, handleFetch));
    }
    teardown() {
        this.worker.cleanupTest(this.testId);
    }
    onFetch(handler) {
        this.fetchHandlers.push(handler);
    }
    async handleFetch(request) {
        return reportFetch(this.testInfo, request, async (req) => {
            for (const handler of this.fetchHandlers.slice().reverse()) {
                const result = await handler(req.clone());
                if (result) {
                    return result;
                }
            }
            if (this.options.fetchLoopback) {
                return fetch(req.clone());
            }
            return undefined;
        });
    }
}
export async function applyNextFixture(use, { testInfo, nextOptions, nextWorker, page, }) {
    const fixture = new NextFixtureImpl(testInfo, nextOptions, nextWorker, page);
    await use(fixture);
    fixture.teardown();
}
