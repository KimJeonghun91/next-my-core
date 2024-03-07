import * as React from 'react';
import { createPortal } from 'react-dom';
export function ShadowPortal({ children }) {
    let portalNode = React.useRef(null);
    let shadowNode = React.useRef(null);
    let [, forceUpdate] = React.useState();
    React.useLayoutEffect(() => {
        const ownerDocument = document;
        portalNode.current = ownerDocument.createElement('nextjs-portal');
        shadowNode.current = portalNode.current.attachShadow({ mode: 'open' });
        ownerDocument.body.appendChild(portalNode.current);
        forceUpdate({});
        return () => {
            if (portalNode.current && portalNode.current.ownerDocument) {
                portalNode.current.ownerDocument.body.removeChild(portalNode.current);
            }
        };
    }, []);
    return shadowNode.current
        ? createPortal(children, shadowNode.current)
        : null;
}
