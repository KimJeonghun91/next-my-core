import mitt from '../../shared/lib/mitt';
class Span {
    constructor(name, options, onSpanEnd) {
        var _a, _b;
        this.name = name;
        this.attributes = (_a = options.attributes) !== null && _a !== void 0 ? _a : {};
        this.startTime = (_b = options.startTime) !== null && _b !== void 0 ? _b : Date.now();
        this.onSpanEnd = onSpanEnd;
        this.state = { state: 'inprogress' };
    }
    end(endTime) {
        if (this.state.state === 'ended') {
            throw new Error('Span has already ended');
        }
        this.state = {
            state: 'ended',
            endTime: endTime !== null && endTime !== void 0 ? endTime : Date.now(),
        };
        this.onSpanEnd(this);
    }
}
class Tracer {
    constructor() {
        this._emitter = mitt();
        this.handleSpanEnd = (span) => {
            this._emitter.emit('spanend', span);
        };
    }
    startSpan(name, options) {
        return new Span(name, options, this.handleSpanEnd);
    }
    onSpanEnd(cb) {
        this._emitter.on('spanend', cb);
        return () => {
            this._emitter.off('spanend', cb);
        };
    }
}
export default new Tracer();
