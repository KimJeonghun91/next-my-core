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
function AlternateLink(_a) {
    var { descriptor } = _a, props = __rest(_a, ["descriptor"]);
    if (!descriptor.url)
        return null;
    return (_jsx("link", Object.assign({}, props, (descriptor.title && { title: descriptor.title }), { href: descriptor.url.toString() })));
}
export function AlternatesMetadata({ alternates, }) {
    if (!alternates)
        return null;
    const { canonical, languages, media, types } = alternates;
    return MetaFilter([
        canonical
            ? AlternateLink({ rel: 'canonical', descriptor: canonical })
            : null,
        languages
            ? Object.entries(languages).flatMap(([locale, descriptors]) => descriptors === null || descriptors === void 0 ? void 0 : descriptors.map((descriptor) => AlternateLink({ rel: 'alternate', hrefLang: locale, descriptor })))
            : null,
        media
            ? Object.entries(media).flatMap(([mediaName, descriptors]) => descriptors === null || descriptors === void 0 ? void 0 : descriptors.map((descriptor) => AlternateLink({ rel: 'alternate', media: mediaName, descriptor })))
            : null,
        types
            ? Object.entries(types).flatMap(([type, descriptors]) => descriptors === null || descriptors === void 0 ? void 0 : descriptors.map((descriptor) => AlternateLink({ rel: 'alternate', type, descriptor })))
            : null,
    ]);
}
