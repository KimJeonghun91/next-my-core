var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useOnClickOutside } from '../../hooks/use-on-click-outside';
const Dialog = function Dialog(_a) {
    var { children, type, onClose } = _a, props = __rest(_a, ["children", "type", "onClose"]);
    const [dialog, setDialog] = React.useState(null);
    const [role, setRole] = React.useState(typeof document !== 'undefined' && document.hasFocus()
        ? 'dialog'
        : undefined);
    const onDialog = React.useCallback((node) => {
        setDialog(node);
    }, []);
    useOnClickOutside(dialog, onClose);
    // Make HTMLElements with `role=link` accessible to be triggered by the
    // keyboard, i.e. [Enter].
    React.useEffect(() => {
        if (dialog == null) {
            return;
        }
        const root = dialog.getRootNode();
        // Always true, but we do this for TypeScript:
        if (!(root instanceof ShadowRoot)) {
            return;
        }
        const shadowRoot = root;
        function handler(e) {
            const el = shadowRoot.activeElement;
            if (e.key === 'Enter' &&
                el instanceof HTMLElement &&
                el.getAttribute('role') === 'link') {
                e.preventDefault();
                e.stopPropagation();
                el.click();
            }
        }
        function handleFocus() {
            // safari will force itself as the active application when a background page triggers any sort of autofocus
            // this is a workaround to only set the dialog role if the document has focus
            setRole(document.hasFocus() ? 'dialog' : undefined);
        }
        shadowRoot.addEventListener('keydown', handler);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleFocus);
        return () => {
            shadowRoot.removeEventListener('keydown', handler);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleFocus);
        };
    }, [dialog]);
    return (_jsxs("div", { ref: onDialog, "data-nextjs-dialog": true, tabIndex: -1, role: role, "aria-labelledby": props['aria-labelledby'], "aria-describedby": props['aria-describedby'], "aria-modal": "true", children: [_jsx("div", { "data-nextjs-dialog-banner": true, className: `banner-${type}` }), children] }));
};
export { Dialog };
