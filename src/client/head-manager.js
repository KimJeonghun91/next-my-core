export const DOMAttributeNames = {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv',
    noModule: 'noModule',
};
function reactElementToDOM({ type, props }) {
    const el = document.createElement(type);
    for (const p in props) {
        if (!props.hasOwnProperty(p))
            continue;
        if (p === 'children' || p === 'dangerouslySetInnerHTML')
            continue;
        // we don't render undefined props to the DOM
        if (props[p] === undefined)
            continue;
        const attr = DOMAttributeNames[p] || p.toLowerCase();
        if (type === 'script' &&
            (attr === 'async' || attr === 'defer' || attr === 'noModule')) {
            ;
            el[attr] = !!props[p];
        }
        else {
            el.setAttribute(attr, props[p]);
        }
    }
    const { children, dangerouslySetInnerHTML } = props;
    if (dangerouslySetInnerHTML) {
        el.innerHTML = dangerouslySetInnerHTML.__html || '';
    }
    else if (children) {
        el.textContent =
            typeof children === 'string'
                ? children
                : Array.isArray(children)
                    ? children.join('')
                    : '';
    }
    return el;
}
/**
 * When a `nonce` is present on an element, browsers such as Chrome and Firefox strip it out of the
 * actual HTML attributes for security reasons *when the element is added to the document*. Thus,
 * given two equivalent elements that have nonces, `Element,isEqualNode()` will return false if one
 * of those elements gets added to the document. Although the `element.nonce` property will be the
 * same for both elements, the one that was added to the document will return an empty string for
 * its nonce HTML attribute value.
 *
 * This custom `isEqualNode()` function therefore removes the nonce value from the `newTag` before
 * comparing it to `oldTag`, restoring it afterwards.
 *
 * For more information, see:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1211471#c12
 */
export function isEqualNode(oldTag, newTag) {
    if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
        const nonce = newTag.getAttribute('nonce');
        // Only strip the nonce if `oldTag` has had it stripped. An element's nonce attribute will not
        // be stripped if there is no content security policy response header that includes a nonce.
        if (nonce && !oldTag.getAttribute('nonce')) {
            const cloneTag = newTag.cloneNode(true);
            cloneTag.setAttribute('nonce', '');
            cloneTag.nonce = nonce;
            return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag);
        }
    }
    return oldTag.isEqualNode(newTag);
}
let updateElements;
if (process.env.__NEXT_STRICT_NEXT_HEAD) {
    updateElements = (type, components) => {
        var _a;
        const headEl = document.querySelector('head');
        if (!headEl)
            return;
        const headMetaTags = headEl.querySelectorAll('meta[name="next-head"]') || [];
        const oldTags = [];
        if (type === 'meta') {
            const metaCharset = headEl.querySelector('meta[charset]');
            if (metaCharset) {
                oldTags.push(metaCharset);
            }
        }
        for (let i = 0; i < headMetaTags.length; i++) {
            const metaTag = headMetaTags[i];
            const headTag = metaTag.nextSibling;
            if (((_a = headTag === null || headTag === void 0 ? void 0 : headTag.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === type) {
                oldTags.push(headTag);
            }
        }
        const newTags = components.map(reactElementToDOM).filter((newTag) => {
            for (let k = 0, len = oldTags.length; k < len; k++) {
                const oldTag = oldTags[k];
                if (isEqualNode(oldTag, newTag)) {
                    oldTags.splice(k, 1);
                    return false;
                }
            }
            return true;
        });
        oldTags.forEach((t) => {
            var _a, _b;
            const metaTag = t.previousSibling;
            if (metaTag && metaTag.getAttribute('name') === 'next-head') {
                (_a = t.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(metaTag);
            }
            (_b = t.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(t);
        });
        newTags.forEach((t) => {
            var _a;
            const meta = document.createElement('meta');
            meta.name = 'next-head';
            meta.content = '1';
            // meta[charset] must be first element so special case
            if (!(((_a = t.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'meta' && t.getAttribute('charset'))) {
                headEl.appendChild(meta);
            }
            headEl.appendChild(t);
        });
    };
}
else {
    updateElements = (type, components) => {
        var _a;
        const headEl = document.getElementsByTagName('head')[0];
        const headCountEl = headEl.querySelector('meta[name=next-head-count]');
        if (process.env.NODE_ENV !== 'production') {
            if (!headCountEl) {
                console.error('Warning: next-head-count is missing. https://nextjs.org/docs/messages/next-head-count-missing');
                return;
            }
        }
        const headCount = Number(headCountEl.content);
        const oldTags = [];
        for (let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++, j = (j === null || j === void 0 ? void 0 : j.previousElementSibling) || null) {
            if (((_a = j === null || j === void 0 ? void 0 : j.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === type) {
                oldTags.push(j);
            }
        }
        const newTags = components.map(reactElementToDOM).filter((newTag) => {
            for (let k = 0, len = oldTags.length; k < len; k++) {
                const oldTag = oldTags[k];
                if (isEqualNode(oldTag, newTag)) {
                    oldTags.splice(k, 1);
                    return false;
                }
            }
            return true;
        });
        oldTags.forEach((t) => { var _a; return (_a = t.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(t); });
        newTags.forEach((t) => headEl.insertBefore(t, headCountEl));
        headCountEl.content = (headCount -
            oldTags.length +
            newTags.length).toString();
    };
}
export default function initHeadManager() {
    return {
        mountedInstances: new Set(),
        updateHead: (head) => {
            const tags = {};
            head.forEach((h) => {
                if (
                // If the font tag is loaded only on client navigation
                // it won't be inlined. In this case revert to the original behavior
                h.type === 'link' &&
                    h.props['data-optimized-fonts']) {
                    if (document.querySelector(`style[data-href="${h.props['data-href']}"]`)) {
                        return;
                    }
                    else {
                        h.props.href = h.props['data-href'];
                        h.props['data-href'] = undefined;
                    }
                }
                const components = tags[h.type] || [];
                components.push(h);
                tags[h.type] = components;
            });
            const titleComponent = tags.title ? tags.title[0] : null;
            let title = '';
            if (titleComponent) {
                const { children } = titleComponent.props;
                title =
                    typeof children === 'string'
                        ? children
                        : Array.isArray(children)
                            ? children.join('')
                            : '';
            }
            if (title !== document.title)
                document.title = title;
            ['meta', 'base', 'link', 'style', 'script'].forEach((type) => {
                updateElements(type, tags[type] || []);
            });
        },
    };
}
