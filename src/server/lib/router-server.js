// This is required before other imports to ensure the require hook is setup.
import '../node-environment';
import '../require-hook';
import url from 'url';
import path from 'path';
import loadConfig from '../config';
import { serveStatic } from '../serve-static';
import setupDebug from 'next/dist/compiled/debug';
import { Telemetry } from '../../telemetry/storage';
import { DecodeError } from '../../shared/lib/utils';
import { findPagesDir } from '../../lib/find-pages-dir';
import { setupFsCheck } from './router-utils/filesystem';
import { proxyRequest } from './router-utils/proxy-request';
import { isAbortError, pipeToNodeResponse } from '../pipe-readable';
import { getResolveRoutes } from './router-utils/resolve-routes';
import { getRequestMeta } from '../request-meta';
import { pathHasPrefix } from '../../shared/lib/router/utils/path-has-prefix';
import { removePathPrefix } from '../../shared/lib/router/utils/remove-path-prefix';
import setupCompression from 'next/dist/compiled/compression';
import { NoFallbackError } from '../base-server';
import { signalFromNodeResponse } from '../web/spec-extension/adapters/next-request';
import { isPostpone } from './router-utils/is-postpone';
import { PHASE_PRODUCTION_SERVER, PHASE_DEVELOPMENT_SERVER, } from '../../shared/lib/constants';
import { RedirectStatusCode } from '../../client/components/redirect-status-code';
import { DevBundlerService } from './dev-bundler-service';
import { trace } from '../../trace';
import { ensureLeadingSlash } from '../../shared/lib/page-path/ensure-leading-slash';
const debug = setupDebug('next:router-server:main');
const isNextFont = (pathname) => pathname && /\/media\/[^/]+\.(woff|woff2|eot|ttf|otf)$/.test(pathname);
const requestHandlers = {};
export async function initialize(opts) {
    if (!process.env.NODE_ENV) {
        // @ts-ignore not readonly
        process.env.NODE_ENV = opts.dev ? 'development' : 'production';
    }
    const config = await loadConfig(opts.dev ? PHASE_DEVELOPMENT_SERVER : PHASE_PRODUCTION_SERVER, opts.dir, { silent: false });
    let compress;
    if ((config === null || config === void 0 ? void 0 : config.compress) !== false) {
        compress = setupCompression();
    }
    const fsChecker = await setupFsCheck({
        dev: opts.dev,
        dir: opts.dir,
        config,
        minimalMode: opts.minimalMode,
    });
    const renderServer = {};
    let developmentBundler;
    let devBundlerService;
    if (opts.dev) {
        const telemetry = new Telemetry({
            distDir: path.join(opts.dir, config.distDir),
        });
        const { pagesDir, appDir } = findPagesDir(opts.dir);
        const { setupDevBundler } = require('./router-utils/setup-dev-bundler');
        const setupDevBundlerSpan = opts.startServerSpan
            ? opts.startServerSpan.traceChild('setup-dev-bundler')
            : trace('setup-dev-bundler');
        developmentBundler = await setupDevBundlerSpan.traceAsyncFn(() => setupDevBundler({
            // Passed here but the initialization of this object happens below, doing the initialization before the setupDev call breaks.
            renderServer,
            appDir,
            pagesDir,
            telemetry,
            fsChecker,
            dir: opts.dir,
            nextConfig: config,
            isCustomServer: opts.customServer,
            turbo: !!process.env.TURBOPACK,
            port: opts.port,
        }));
        devBundlerService = new DevBundlerService(developmentBundler, 
        // The request handler is assigned below, this allows us to create a lazy
        // reference to it.
        (req, res) => {
            return requestHandlers[opts.dir](req, res);
        });
    }
    renderServer.instance =
        require('./render-server');
    const requestHandlerImpl = async (req, res) => {
        if (compress) {
            // @ts-expect-error not express req/res
            compress(req, res, () => { });
        }
        req.on('error', (_err) => {
            // TODO: log socket errors?
        });
        res.on('error', (_err) => {
            // TODO: log socket errors?
        });
        const invokedOutputs = new Set();
        async function invokeRender(parsedUrl, invokePath, handleIndex, additionalInvokeHeaders = {}) {
            var _a, _b;
            // invokeRender expects /api routes to not be locale prefixed
            // so normalize here before continuing
            if (config.i18n &&
                removePathPrefix(invokePath, config.basePath).startsWith(`/${parsedUrl.query.__nextLocale}/api`)) {
                invokePath = fsChecker.handleLocale(removePathPrefix(invokePath, config.basePath)).pathname;
            }
            if (req.headers['x-nextjs-data'] &&
                ((_a = fsChecker.getMiddlewareMatchers()) === null || _a === void 0 ? void 0 : _a.length) &&
                removePathPrefix(invokePath, config.basePath) === '/404') {
                res.setHeader('x-nextjs-matched-path', parsedUrl.pathname || '');
                res.statusCode = 200;
                res.setHeader('content-type', 'application/json');
                res.end('{}');
                return null;
            }
            if (!handlers) {
                throw new Error('Failed to initialize render server');
            }
            const invokeHeaders = Object.assign(Object.assign(Object.assign({}, req.headers), { 'x-middleware-invoke': '', 'x-invoke-path': invokePath, 'x-invoke-query': encodeURIComponent(JSON.stringify(parsedUrl.query)) }), (additionalInvokeHeaders || {}));
            Object.assign(req.headers, invokeHeaders);
            debug('invokeRender', req.url, invokeHeaders);
            try {
                const initResult = await ((_b = renderServer === null || renderServer === void 0 ? void 0 : renderServer.instance) === null || _b === void 0 ? void 0 : _b.initialize(renderServerOpts));
                try {
                    await (initResult === null || initResult === void 0 ? void 0 : initResult.requestHandler(req, res));
                }
                catch (err) {
                    if (err instanceof NoFallbackError) {
                        // eslint-disable-next-line
                        await handleRequest(handleIndex + 1);
                        return;
                    }
                    throw err;
                }
                return;
            }
            catch (e) {
                // If the client aborts before we can receive a response object (when
                // the headers are flushed), then we can early exit without further
                // processing.
                if (isAbortError(e)) {
                    return;
                }
                throw e;
            }
        }
        const handleRequest = async (handleIndex) => {
            var _a;
            if (handleIndex > 5) {
                throw new Error(`Attempted to handle request too many times ${req.url}`);
            }
            // handle hot-reloader first
            if (developmentBundler) {
                const origUrl = req.url || '/';
                if (config.basePath && pathHasPrefix(origUrl, config.basePath)) {
                    req.url = removePathPrefix(origUrl, config.basePath);
                }
                const parsedUrl = url.parse(req.url || '/');
                const hotReloaderResult = await developmentBundler.hotReloader.run(req, res, parsedUrl);
                if (hotReloaderResult.finished) {
                    return hotReloaderResult;
                }
                req.url = origUrl;
            }
            const { finished, parsedUrl, statusCode, resHeaders, bodyStream, matchedOutput, } = await resolveRoutes({
                req,
                res,
                isUpgradeReq: false,
                signal: signalFromNodeResponse(res),
                invokedOutputs,
            });
            if (res.closed || res.finished) {
                return;
            }
            if (developmentBundler && (matchedOutput === null || matchedOutput === void 0 ? void 0 : matchedOutput.type) === 'devVirtualFsItem') {
                const origUrl = req.url || '/';
                if (config.basePath && pathHasPrefix(origUrl, config.basePath)) {
                    req.url = removePathPrefix(origUrl, config.basePath);
                }
                if (resHeaders) {
                    for (const key of Object.keys(resHeaders)) {
                        res.setHeader(key, resHeaders[key]);
                    }
                }
                const result = await developmentBundler.requestHandler(req, res);
                if (result.finished) {
                    return;
                }
                // TODO: throw invariant if we resolved to this but it wasn't handled?
                req.url = origUrl;
            }
            debug('requestHandler!', req.url, {
                matchedOutput,
                statusCode,
                resHeaders,
                bodyStream: !!bodyStream,
                parsedUrl: {
                    pathname: parsedUrl.pathname,
                    query: parsedUrl.query,
                },
                finished,
            });
            // apply any response headers from routing
            for (const key of Object.keys(resHeaders || {})) {
                res.setHeader(key, resHeaders[key]);
            }
            // handle redirect
            if (!bodyStream && statusCode && statusCode > 300 && statusCode < 400) {
                const destination = url.format(parsedUrl);
                res.statusCode = statusCode;
                res.setHeader('location', destination);
                if (statusCode === RedirectStatusCode.PermanentRedirect) {
                    res.setHeader('Refresh', `0;url=${destination}`);
                }
                return res.end(destination);
            }
            // handle middleware body response
            if (bodyStream) {
                res.statusCode = statusCode || 200;
                return await pipeToNodeResponse(bodyStream, res);
            }
            if (finished && parsedUrl.protocol) {
                return await proxyRequest(req, res, parsedUrl, undefined, (_a = getRequestMeta(req, 'clonableBody')) === null || _a === void 0 ? void 0 : _a.cloneBodyStream(), config.experimental.proxyTimeout);
            }
            if ((matchedOutput === null || matchedOutput === void 0 ? void 0 : matchedOutput.fsPath) && matchedOutput.itemPath) {
                if (opts.dev &&
                    (fsChecker.appFiles.has(matchedOutput.itemPath) ||
                        fsChecker.pageFiles.has(matchedOutput.itemPath))) {
                    res.statusCode = 500;
                    await invokeRender(parsedUrl, '/_error', handleIndex, {
                        'x-invoke-status': '500',
                        'x-invoke-error': JSON.stringify({
                            message: `A conflicting public file and page file was found for path ${matchedOutput.itemPath} https://nextjs.org/docs/messages/conflicting-public-file-page`,
                        }),
                    });
                    return;
                }
                if (!res.getHeader('cache-control') &&
                    matchedOutput.type === 'nextStaticFolder') {
                    if (opts.dev && !isNextFont(parsedUrl.pathname)) {
                        res.setHeader('Cache-Control', 'no-store, must-revalidate');
                    }
                    else {
                        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                    }
                }
                if (!(req.method === 'GET' || req.method === 'HEAD')) {
                    res.setHeader('Allow', ['GET', 'HEAD']);
                    res.statusCode = 405;
                    return await invokeRender(url.parse('/405', true), '/405', handleIndex, {
                        'x-invoke-status': '405',
                    });
                }
                try {
                    return await serveStatic(req, res, matchedOutput.itemPath, {
                        root: matchedOutput.itemsRoot,
                        // Ensures that etags are not generated for static files when disabled.
                        etag: config.generateEtags,
                    });
                }
                catch (err) {
                    /**
                     * Hardcoded every possible error status code that could be thrown by "serveStatic" method
                     * This is done by searching "this.error" inside "send" module's source code:
                     * https://github.com/pillarjs/send/blob/master/index.js
                     * https://github.com/pillarjs/send/blob/develop/index.js
                     */
                    const POSSIBLE_ERROR_CODE_FROM_SERVE_STATIC = new Set([
                        // send module will throw 500 when header is already sent or fs.stat error happens
                        // https://github.com/pillarjs/send/blob/53f0ab476145670a9bdd3dc722ab2fdc8d358fc6/index.js#L392
                        // Note: we will use Next.js built-in 500 page to handle 500 errors
                        // 500,
                        // send module will throw 404 when file is missing
                        // https://github.com/pillarjs/send/blob/53f0ab476145670a9bdd3dc722ab2fdc8d358fc6/index.js#L421
                        // Note: we will use Next.js built-in 404 page to handle 404 errors
                        // 404,
                        // send module will throw 403 when redirecting to a directory without enabling directory listing
                        // https://github.com/pillarjs/send/blob/53f0ab476145670a9bdd3dc722ab2fdc8d358fc6/index.js#L484
                        // Note: Next.js throws a different error (without status code) for directory listing
                        // 403,
                        // send module will throw 400 when fails to normalize the path
                        // https://github.com/pillarjs/send/blob/53f0ab476145670a9bdd3dc722ab2fdc8d358fc6/index.js#L520
                        400,
                        // send module will throw 412 with conditional GET request
                        // https://github.com/pillarjs/send/blob/53f0ab476145670a9bdd3dc722ab2fdc8d358fc6/index.js#L632
                        412,
                        // send module will throw 416 when range is not satisfiable
                        // https://github.com/pillarjs/send/blob/53f0ab476145670a9bdd3dc722ab2fdc8d358fc6/index.js#L669
                        416,
                    ]);
                    let validErrorStatus = POSSIBLE_ERROR_CODE_FROM_SERVE_STATIC.has(err.statusCode);
                    // normalize non-allowed status codes
                    if (!validErrorStatus) {
                        ;
                        err.statusCode = 400;
                    }
                    if (typeof err.statusCode === 'number') {
                        const invokePath = `/${err.statusCode}`;
                        const invokeStatus = `${err.statusCode}`;
                        res.statusCode = err.statusCode;
                        return await invokeRender(url.parse(invokePath, true), invokePath, handleIndex, {
                            'x-invoke-status': invokeStatus,
                        });
                    }
                    throw err;
                }
            }
            if (matchedOutput) {
                invokedOutputs.add(matchedOutput.itemPath);
                return await invokeRender(parsedUrl, parsedUrl.pathname || '/', handleIndex, {
                    'x-invoke-output': matchedOutput.itemPath,
                });
            }
            // 404 case
            res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
            // Short-circuit favicon.ico serving so that the 404 page doesn't get built as favicon is requested by the browser when loading any route.
            if (opts.dev && !matchedOutput && parsedUrl.pathname === '/favicon.ico') {
                res.statusCode = 404;
                res.end('');
                return null;
            }
            const appNotFound = opts.dev
                ? developmentBundler === null || developmentBundler === void 0 ? void 0 : developmentBundler.serverFields.hasAppNotFound
                : await fsChecker.getItem('/_not-found');
            res.statusCode = 404;
            if (appNotFound) {
                return await invokeRender(parsedUrl, opts.dev ? '/not-found' : '/_not-found', handleIndex, {
                    'x-invoke-status': '404',
                });
            }
            await invokeRender(parsedUrl, '/404', handleIndex, {
                'x-invoke-status': '404',
            });
        };
        try {
            await handleRequest(0);
        }
        catch (err) {
            try {
                let invokePath = '/500';
                let invokeStatus = '500';
                if (err instanceof DecodeError) {
                    invokePath = '/400';
                    invokeStatus = '400';
                }
                else {
                    console.error(err);
                }
                res.statusCode = Number(invokeStatus);
                return await invokeRender(url.parse(invokePath, true), invokePath, 0, {
                    'x-invoke-status': invokeStatus,
                });
            }
            catch (err2) {
                console.error(err2);
            }
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    };
    let requestHandler = requestHandlerImpl;
    if (opts.experimentalTestProxy) {
        // Intercept fetch and other testmode apis.
        const { wrapRequestHandlerWorker, interceptTestApis, } = require('next/dist/experimental/testmode/server');
        requestHandler = wrapRequestHandlerWorker(requestHandler);
        interceptTestApis();
    }
    requestHandlers[opts.dir] = requestHandler;
    const renderServerOpts = {
        port: opts.port,
        dir: opts.dir,
        hostname: opts.hostname,
        minimalMode: opts.minimalMode,
        dev: !!opts.dev,
        server: opts.server,
        isNodeDebugging: !!opts.isNodeDebugging,
        serverFields: (developmentBundler === null || developmentBundler === void 0 ? void 0 : developmentBundler.serverFields) || {},
        experimentalTestProxy: !!opts.experimentalTestProxy,
        experimentalHttpsServer: !!opts.experimentalHttpsServer,
        bundlerService: devBundlerService,
        startServerSpan: opts.startServerSpan,
    };
    renderServerOpts.serverFields.routerServerHandler = requestHandlerImpl;
    // pre-initialize workers
    const handlers = await renderServer.instance.initialize(renderServerOpts);
    const logError = async (type, err) => {
        if (isPostpone(err)) {
            // React postpones that are unhandled might end up logged here but they're
            // not really errors. They're just part of rendering.
            return;
        }
        await (developmentBundler === null || developmentBundler === void 0 ? void 0 : developmentBundler.logErrorWithOriginalStack(err, type));
    };
    process.on('uncaughtException', logError.bind(null, 'uncaughtException'));
    process.on('unhandledRejection', logError.bind(null, 'unhandledRejection'));
    const resolveRoutes = getResolveRoutes(fsChecker, config, opts, renderServer.instance, renderServerOpts, developmentBundler === null || developmentBundler === void 0 ? void 0 : developmentBundler.ensureMiddleware);
    const upgradeHandler = async (req, socket, head) => {
        try {
            req.on('error', (_err) => {
                // TODO: log socket errors?
                // console.error(_err);
            });
            socket.on('error', (_err) => {
                // TODO: log socket errors?
                // console.error(_err);
            });
            if (opts.dev && developmentBundler && req.url) {
                const { basePath, assetPrefix } = config;
                const isHMRRequest = req.url.startsWith(ensureLeadingSlash(`${assetPrefix || basePath}/_next/webpack-hmr`));
                // only handle HMR requests if the basePath in the request
                // matches the basePath for the handler responding to the request
                if (isHMRRequest) {
                    return developmentBundler.hotReloader.onHMR(req, socket, head);
                }
            }
            const { matchedOutput, parsedUrl } = await resolveRoutes({
                req,
                res: socket,
                isUpgradeReq: true,
                signal: signalFromNodeResponse(socket),
            });
            // TODO: allow upgrade requests to pages/app paths?
            // this was not previously supported
            if (matchedOutput) {
                return socket.end();
            }
            if (parsedUrl.protocol) {
                return await proxyRequest(req, socket, parsedUrl, head);
            }
            // If there's no matched output, we don't handle the request as user's
            // custom WS server may be listening on the same path.
        }
        catch (err) {
            console.error('Error handling upgrade request', err);
            socket.end();
        }
    };
    return [requestHandler, upgradeHandler];
}
