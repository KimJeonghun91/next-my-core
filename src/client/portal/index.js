import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
export const Portal = ({ children, type }) => {
    const [portalNode, setPortalNode] = useState(null);
    useEffect(() => {
        const element = document.createElement(type);
        document.body.appendChild(element);
        setPortalNode(element);
        return () => {
            document.body.removeChild(element);
        };
    }, [type]);
    return portalNode ? createPortal(children, portalNode) : null;
};
