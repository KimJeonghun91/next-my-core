import { SERVER_DIRECTORY } from '../../../shared/lib/constants';
import { RouteKind } from '../route-kind';
import { AppPageRouteMatcherProvider } from './app-page-route-matcher-provider';
describe('AppPageRouteMatcherProvider', () => {
    it('returns no routes with an empty manifest', async () => {
        const loader = { load: jest.fn(() => ({})) };
        const matcher = new AppPageRouteMatcherProvider('<root>', loader);
        await expect(matcher.matchers()).resolves.toEqual([]);
    });
    describe('manifest matching', () => {
        it.each([
            {
                manifest: {
                    '/page': 'app/page.js',
                },
                route: {
                    kind: RouteKind.APP_PAGE,
                    pathname: '/',
                    filename: `<root>/${SERVER_DIRECTORY}/app/page.js`,
                    page: '/page',
                    bundlePath: 'app/page',
                    appPaths: ['/page'],
                },
            },
            {
                manifest: {
                    '/(marketing)/about/page': 'app/(marketing)/about/page.js',
                },
                route: {
                    kind: RouteKind.APP_PAGE,
                    pathname: '/about',
                    filename: `<root>/${SERVER_DIRECTORY}/app/(marketing)/about/page.js`,
                    page: '/(marketing)/about/page',
                    bundlePath: 'app/(marketing)/about/page',
                    appPaths: ['/(marketing)/about/page'],
                },
            },
            {
                manifest: {
                    '/dashboard/users/[id]/page': 'app/dashboard/users/[id]/page.js',
                },
                route: {
                    kind: RouteKind.APP_PAGE,
                    pathname: '/dashboard/users/[id]',
                    filename: `<root>/${SERVER_DIRECTORY}/app/dashboard/users/[id]/page.js`,
                    page: '/dashboard/users/[id]/page',
                    bundlePath: 'app/dashboard/users/[id]/page',
                    appPaths: ['/dashboard/users/[id]/page'],
                },
            },
            {
                manifest: { '/dashboard/users/page': 'app/dashboard/users/page.js' },
                route: {
                    kind: RouteKind.APP_PAGE,
                    pathname: '/dashboard/users',
                    filename: `<root>/${SERVER_DIRECTORY}/app/dashboard/users/page.js`,
                    page: '/dashboard/users/page',
                    bundlePath: 'app/dashboard/users/page',
                    appPaths: ['/dashboard/users/page'],
                },
            },
            {
                manifest: {
                    '/dashboard/users/page': 'app/dashboard/users/page.js',
                    '/(marketing)/dashboard/users/page': 'app/(marketing)/dashboard/users/page.js',
                },
                route: {
                    kind: RouteKind.APP_PAGE,
                    pathname: '/dashboard/users',
                    filename: `<root>/${SERVER_DIRECTORY}/app/dashboard/users/page.js`,
                    page: '/dashboard/users/page',
                    bundlePath: 'app/dashboard/users/page',
                    appPaths: [
                        '/dashboard/users/page',
                        '/(marketing)/dashboard/users/page',
                    ],
                },
            },
        ])('returns the correct routes for $route.pathname', async ({ manifest, route }) => {
            const loader = {
                load: jest.fn(() => (Object.assign({ '/users/[id]/route': 'app/users/[id]/route.js', '/users/route': 'app/users/route.js' }, manifest))),
            };
            const matcher = new AppPageRouteMatcherProvider('<root>', loader);
            const matchers = await matcher.matchers();
            expect(loader.load).toHaveBeenCalled();
            expect(matchers).toHaveLength(1);
            expect(matchers[0].definition).toEqual(route);
        });
    });
});
