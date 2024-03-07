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
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { MetaFilter } from './meta';
function IconDescriptorLink({ icon }) {
    const { url, rel = 'icon' } = icon, props = __rest(icon, ["url", "rel"]);
    return _jsx("link", Object.assign({ rel: rel, href: url.toString() }, props));
}
function IconLink({ rel, icon }) {
    if (typeof icon === 'object' && !(icon instanceof URL)) {
        if (!icon.rel && rel)
            icon.rel = rel;
        return IconDescriptorLink({ icon });
    }
    else {
        const href = icon.toString();
        return _jsx("link", { rel: rel, href: href });
    }
}
export function IconsMetadata({ icons }) {
    if (!icons)
        return null;
    const shortcutList = icons.shortcut;
    const iconList = icons.icon;
    const appleList = icons.apple;
    const otherList = icons.other;
    return MetaFilter([
        shortcutList
            ? shortcutList.map((icon) => IconLink({ rel: 'shortcut icon', icon }))
            : null,
        iconList ? iconList.map((icon) => IconLink({ rel: 'icon', icon })) : null,
        appleList
            ? appleList.map((icon) => IconLink({ rel: 'apple-touch-icon', icon }))
            : null,
        otherList ? otherList.map((icon) => IconDescriptorLink({ icon })) : null,
    ]);
}
