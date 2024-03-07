const REGEXP_DIRECTORY_DUNDER = /[\\/]__[^\\/]+(?<![\\/]__(?:tests|mocks))__[\\/]/i;
const REGEXP_DIRECTORY_TESTS = /[\\/]__(tests|mocks)__[\\/]/i;
const REGEXP_FILE_TEST = /\.(?:spec|test)\.[^.]+$/i;
const EVENT_TYPE_CHECK_COMPLETED = 'NEXT_TYPE_CHECK_COMPLETED';
export function eventTypeCheckCompleted(event) {
    return {
        eventName: EVENT_TYPE_CHECK_COMPLETED,
        payload: event,
    };
}
const EVENT_LINT_CHECK_COMPLETED = 'NEXT_LINT_CHECK_COMPLETED';
export function eventLintCheckCompleted(event) {
    return {
        eventName: EVENT_LINT_CHECK_COMPLETED,
        payload: event,
    };
}
const EVENT_BUILD_COMPLETED = 'NEXT_BUILD_COMPLETED';
export function eventBuildCompleted(pagePaths, event) {
    return {
        eventName: EVENT_BUILD_COMPLETED,
        payload: Object.assign(Object.assign({}, event), { totalPageCount: pagePaths.length, hasDunderPages: pagePaths.some((path) => REGEXP_DIRECTORY_DUNDER.test(path)), hasTestPages: pagePaths.some((path) => REGEXP_DIRECTORY_TESTS.test(path) || REGEXP_FILE_TEST.test(path)), totalAppPagesCount: event.totalAppPagesCount }),
    };
}
const EVENT_BUILD_OPTIMIZED = 'NEXT_BUILD_OPTIMIZED';
export function eventBuildOptimize(pagePaths, event) {
    return {
        eventName: EVENT_BUILD_OPTIMIZED,
        payload: Object.assign(Object.assign({}, event), { totalPageCount: pagePaths.length, hasDunderPages: pagePaths.some((path) => REGEXP_DIRECTORY_DUNDER.test(path)), hasTestPages: pagePaths.some((path) => REGEXP_DIRECTORY_TESTS.test(path) || REGEXP_FILE_TEST.test(path)), totalAppPagesCount: event.totalAppPagesCount, staticAppPagesCount: event.staticAppPagesCount, serverAppPagesCount: event.serverAppPagesCount, edgeRuntimeAppCount: event.edgeRuntimeAppCount, edgeRuntimePagesCount: event.edgeRuntimePagesCount }),
    };
}
export const EVENT_BUILD_FEATURE_USAGE = 'NEXT_BUILD_FEATURE_USAGE';
export function eventBuildFeatureUsage(usages) {
    return usages.map(({ featureName, invocationCount }) => ({
        eventName: EVENT_BUILD_FEATURE_USAGE,
        payload: {
            featureName,
            invocationCount,
        },
    }));
}
export const EVENT_NAME_PACKAGE_USED_IN_GET_SERVER_SIDE_PROPS = 'NEXT_PACKAGE_USED_IN_GET_SERVER_SIDE_PROPS';
export function eventPackageUsedInGetServerSideProps(packagesUsedInServerSideProps) {
    return packagesUsedInServerSideProps.map((packageName) => ({
        eventName: EVENT_NAME_PACKAGE_USED_IN_GET_SERVER_SIDE_PROPS,
        payload: {
            package: packageName,
        },
    }));
}
