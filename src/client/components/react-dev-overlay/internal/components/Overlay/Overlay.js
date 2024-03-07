import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-ignore
import allyTrap from './maintain--tab-focus';
import * as React from 'react';
import { lock, unlock } from './body-locker';
const Overlay = function Overlay({ className, children, fixed, }) {
    React.useEffect(() => {
        lock();
        return () => {
            unlock();
        };
    }, []);
    const [overlay, setOverlay] = React.useState(null);
    const onOverlay = React.useCallback((el) => {
        setOverlay(el);
    }, []);
    React.useEffect(() => {
        if (overlay == null) {
            return;
        }
        const handle2 = allyTrap({ context: overlay });
        return () => {
            handle2.disengage();
        };
    }, [overlay]);
    return (_jsxs("div", { "data-nextjs-dialog-overlay": true, className: className, ref: onOverlay, children: [_jsx("div", { "data-nextjs-dialog-backdrop": true, "data-nextjs-dialog-backdrop-fixed": fixed ? true : undefined }), children] }));
};
export { Overlay };
