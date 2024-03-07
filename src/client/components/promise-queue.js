var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PromiseQueue_instances, _PromiseQueue_maxConcurrency, _PromiseQueue_runningCount, _PromiseQueue_queue, _PromiseQueue_processNext;
/*
    This is a simple promise queue that allows you to limit the number of concurrent promises
    that are running at any given time. It's used to limit the number of concurrent
    prefetch requests that are being made to the server but could be used for other
    things as well.
*/
export class PromiseQueue {
    constructor(maxConcurrency = 5) {
        _PromiseQueue_instances.add(this);
        _PromiseQueue_maxConcurrency.set(this, void 0);
        _PromiseQueue_runningCount.set(this, void 0);
        _PromiseQueue_queue.set(this, void 0);
        __classPrivateFieldSet(this, _PromiseQueue_maxConcurrency, maxConcurrency, "f");
        __classPrivateFieldSet(this, _PromiseQueue_runningCount, 0, "f");
        __classPrivateFieldSet(this, _PromiseQueue_queue, [], "f");
    }
    enqueue(promiseFn) {
        let taskResolve;
        let taskReject;
        const taskPromise = new Promise((resolve, reject) => {
            taskResolve = resolve;
            taskReject = reject;
        });
        const task = async () => {
            var _a, _b;
            try {
                __classPrivateFieldSet(this, _PromiseQueue_runningCount, (_a = __classPrivateFieldGet(this, _PromiseQueue_runningCount, "f"), _a++, _a), "f");
                const result = await promiseFn();
                taskResolve(result);
            }
            catch (error) {
                taskReject(error);
            }
            finally {
                __classPrivateFieldSet(this, _PromiseQueue_runningCount, (_b = __classPrivateFieldGet(this, _PromiseQueue_runningCount, "f"), _b--, _b), "f");
                __classPrivateFieldGet(this, _PromiseQueue_instances, "m", _PromiseQueue_processNext).call(this);
            }
        };
        const enqueueResult = { promiseFn: taskPromise, task };
        // wonder if we should take a LIFO approach here
        __classPrivateFieldGet(this, _PromiseQueue_queue, "f").push(enqueueResult);
        __classPrivateFieldGet(this, _PromiseQueue_instances, "m", _PromiseQueue_processNext).call(this);
        return taskPromise;
    }
    bump(promiseFn) {
        const index = __classPrivateFieldGet(this, _PromiseQueue_queue, "f").findIndex((item) => item.promiseFn === promiseFn);
        if (index > -1) {
            const bumpedItem = __classPrivateFieldGet(this, _PromiseQueue_queue, "f").splice(index, 1)[0];
            __classPrivateFieldGet(this, _PromiseQueue_queue, "f").unshift(bumpedItem);
            __classPrivateFieldGet(this, _PromiseQueue_instances, "m", _PromiseQueue_processNext).call(this, true);
        }
    }
}
_PromiseQueue_maxConcurrency = new WeakMap(), _PromiseQueue_runningCount = new WeakMap(), _PromiseQueue_queue = new WeakMap(), _PromiseQueue_instances = new WeakSet(), _PromiseQueue_processNext = function _PromiseQueue_processNext(forced = false) {
    var _a;
    if ((__classPrivateFieldGet(this, _PromiseQueue_runningCount, "f") < __classPrivateFieldGet(this, _PromiseQueue_maxConcurrency, "f") || forced) &&
        __classPrivateFieldGet(this, _PromiseQueue_queue, "f").length > 0) {
        (_a = __classPrivateFieldGet(this, _PromiseQueue_queue, "f").shift()) === null || _a === void 0 ? void 0 : _a.task();
    }
};
