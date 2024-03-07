import { Children, useEffect, useLayoutEffect } from 'react';
const isServer = typeof window === 'undefined';
const useClientOnlyLayoutEffect = isServer ? () => { } : useLayoutEffect;
const useClientOnlyEffect = isServer ? () => { } : useEffect;
export default function SideEffect(props) {
    var _a;
    const { headManager, reduceComponentsToState } = props;
    function emitChange() {
        if (headManager && headManager.mountedInstances) {
            const headElements = Children.toArray(Array.from(headManager.mountedInstances).filter(Boolean));
            headManager.updateHead(reduceComponentsToState(headElements, props));
        }
    }
    if (isServer) {
        (_a = headManager === null || headManager === void 0 ? void 0 : headManager.mountedInstances) === null || _a === void 0 ? void 0 : _a.add(props.children);
        emitChange();
    }
    useClientOnlyLayoutEffect(() => {
        var _a;
        (_a = headManager === null || headManager === void 0 ? void 0 : headManager.mountedInstances) === null || _a === void 0 ? void 0 : _a.add(props.children);
        return () => {
            var _a;
            (_a = headManager === null || headManager === void 0 ? void 0 : headManager.mountedInstances) === null || _a === void 0 ? void 0 : _a.delete(props.children);
        };
    });
    // We need to call `updateHead` method whenever the `SideEffect` is trigger in all
    // life-cycles: mount, update, unmount. However, if there are multiple `SideEffect`s
    // being rendered, we only trigger the method from the last one.
    // This is ensured by keeping the last unflushed `updateHead` in the `_pendingUpdate`
    // singleton in the layout effect pass, and actually trigger it in the effect pass.
    useClientOnlyLayoutEffect(() => {
        if (headManager) {
            headManager._pendingUpdate = emitChange;
        }
        return () => {
            if (headManager) {
                headManager._pendingUpdate = emitChange;
            }
        };
    });
    useClientOnlyEffect(() => {
        if (headManager && headManager._pendingUpdate) {
            headManager._pendingUpdate();
            headManager._pendingUpdate = null;
        }
        return () => {
            if (headManager && headManager._pendingUpdate) {
                headManager._pendingUpdate();
                headManager._pendingUpdate = null;
            }
        };
    });
    return null;
}
