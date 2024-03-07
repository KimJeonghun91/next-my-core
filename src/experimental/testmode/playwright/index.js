// eslint-disable-next-line import/no-extraneous-dependencies
import * as base from '@playwright/test';
import { applyNextWorkerFixture } from './next-worker-fixture';
import { applyNextFixture } from './next-fixture';
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@playwright/test';
export function defineConfig(config) {
    return base.defineConfig(config);
}
export const test = base.test.extend({
    nextOptions: [{ fetchLoopback: false }, { option: true }],
    _nextWorker: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            await applyNextWorkerFixture(use);
        },
        { scope: 'worker', auto: true },
    ],
    next: [
        async ({ nextOptions, _nextWorker, page }, use, testInfo) => {
            await applyNextFixture(use, {
                testInfo,
                nextWorker: _nextWorker,
                page,
                nextOptions,
            });
        },
        { auto: true },
    ],
});
export default test;
