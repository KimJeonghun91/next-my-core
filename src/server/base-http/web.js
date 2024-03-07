import { toNodeOutgoingHttpHeaders } from '../web/utils';
import { BaseNextRequest, BaseNextResponse } from './index';
import { DetachedPromise } from '../../lib/detached-promise';
export class WebNextRequest extends BaseNextRequest {
    constructor(request) {
        const url = new URL(request.url);
        super(request.method, url.href.slice(url.origin.length), request.clone().body);
        this.request = request;
        this.headers = {};
        for (const [name, value] of request.headers.entries()) {
            this.headers[name] = value;
        }
    }
    async parseBody(_limit) {
        throw new Error('parseBody is not implemented in the web runtime');
    }
}
export class WebNextResponse extends BaseNextResponse {
    constructor(transformStream = new TransformStream()) {
        super(transformStream.writable);
        this.transformStream = transformStream;
        this.headers = new Headers();
        this.textBody = undefined;
        this.sendPromise = new DetachedPromise();
        this._sent = false;
    }
    setHeader(name, value) {
        this.headers.delete(name);
        for (const val of Array.isArray(value) ? value : [value]) {
            this.headers.append(name, val);
        }
        return this;
    }
    removeHeader(name) {
        this.headers.delete(name);
        return this;
    }
    getHeaderValues(name) {
        var _a;
        // https://developer.mozilla.org/docs/Web/API/Headers/get#example
        return (_a = this.getHeader(name)) === null || _a === void 0 ? void 0 : _a.split(',').map((v) => v.trimStart());
    }
    getHeader(name) {
        var _a;
        return (_a = this.headers.get(name)) !== null && _a !== void 0 ? _a : undefined;
    }
    getHeaders() {
        return toNodeOutgoingHttpHeaders(this.headers);
    }
    hasHeader(name) {
        return this.headers.has(name);
    }
    appendHeader(name, value) {
        this.headers.append(name, value);
        return this;
    }
    body(value) {
        this.textBody = value;
        return this;
    }
    send() {
        this.sendPromise.resolve();
        this._sent = true;
    }
    get sent() {
        return this._sent;
    }
    async toResponse() {
        var _a;
        // If we haven't called `send` yet, wait for it to be called.
        if (!this.sent)
            await this.sendPromise.promise;
        return new Response((_a = this.textBody) !== null && _a !== void 0 ? _a : this.transformStream.readable, {
            headers: this.headers,
            status: this.statusCode,
            statusText: this.statusMessage,
        });
    }
}
