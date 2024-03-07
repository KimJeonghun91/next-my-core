// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from '@playwright/test';
function isWithRunAsStep(testInfo) {
    return '_runAsStep' in testInfo;
}
export async function step(testInfo, props, handler) {
    if (isWithRunAsStep(testInfo)) {
        return testInfo._runAsStep(props, ({ complete }) => handler(complete));
    }
    // Fallback to the `test.step()`.
    let result;
    let reportedError;
    try {
        console.log(props.title, props);
        await test.step(props.title, async () => {
            result = await handler(({ error }) => {
                reportedError = error;
                if (reportedError) {
                    throw reportedError;
                }
            });
        });
    }
    catch (error) {
        if (error !== reportedError) {
            throw error;
        }
    }
    return result;
}
