import { resolveAsArrayOrUndefined } from '../generate/utils';
import { getSocialImageFallbackMetadataBase, isStringOrURL, resolveUrl, resolveAbsoluteUrlWithPathname, } from './resolve-url';
import { resolveTitle } from './resolve-title';
import { isFullStringUrl } from '../../url';
import { warnOnce } from '../../../build/output/log';
const OgTypeFields = {
    article: ['authors', 'tags'],
    song: ['albums', 'musicians'],
    playlist: ['albums', 'musicians'],
    radio: ['creators'],
    video: ['actors', 'directors', 'writers', 'tags'],
    basic: [
        'emails',
        'phoneNumbers',
        'faxNumbers',
        'alternateLocale',
        'audio',
        'videos',
    ],
};
function resolveAndValidateImage(item, metadataBase, isMetadataBaseMissing) {
    if (!item)
        return undefined;
    const isItemUrl = isStringOrURL(item);
    const inputUrl = isItemUrl ? item : item.url;
    if (!inputUrl)
        return undefined;
    validateResolvedImageUrl(inputUrl, metadataBase, isMetadataBaseMissing);
    return isItemUrl
        ? {
            url: resolveUrl(inputUrl, metadataBase),
        }
        : Object.assign(Object.assign({}, item), { 
            // Update image descriptor url
            url: resolveUrl(inputUrl, metadataBase) });
}
export function resolveImages(images, metadataBase) {
    const resolvedImages = resolveAsArrayOrUndefined(images);
    if (!resolvedImages)
        return resolvedImages;
    const { isMetadataBaseMissing, fallbackMetadataBase } = getSocialImageFallbackMetadataBase(metadataBase);
    const nonNullableImages = [];
    for (const item of resolvedImages) {
        const resolvedItem = resolveAndValidateImage(item, fallbackMetadataBase, isMetadataBaseMissing);
        if (!resolvedItem)
            continue;
        nonNullableImages.push(resolvedItem);
    }
    return nonNullableImages;
}
function getFieldsByOgType(ogType) {
    switch (ogType) {
        case 'article':
        case 'book':
            return OgTypeFields.article;
        case 'music.song':
        case 'music.album':
            return OgTypeFields.song;
        case 'music.playlist':
            return OgTypeFields.playlist;
        case 'music.radio_station':
            return OgTypeFields.radio;
        case 'video.movie':
        case 'video.episode':
            return OgTypeFields.video;
        default:
            return OgTypeFields.basic;
    }
}
function validateResolvedImageUrl(inputUrl, fallbackMetadataBase, isMetadataBaseMissing) {
    // Only warn on the image url that needs to be resolved with metadataBase
    if (typeof inputUrl === 'string' &&
        !isFullStringUrl(inputUrl) &&
        isMetadataBaseMissing) {
        warnOnce(`metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "${fallbackMetadataBase.origin}". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase`);
    }
}
export const resolveOpenGraph = (openGraph, metadataBase, metadataContext, titleTemplate) => {
    if (!openGraph)
        return null;
    function resolveProps(target, og) {
        const ogType = og && 'type' in og ? og.type : undefined;
        const keys = getFieldsByOgType(ogType);
        for (const k of keys) {
            const key = k;
            if (key in og && key !== 'url') {
                const value = og[key];
                if (value) {
                    const arrayValue = resolveAsArrayOrUndefined(value);
                    target[key] = arrayValue;
                }
            }
        }
        target.images = resolveImages(og.images, metadataBase);
    }
    const resolved = Object.assign(Object.assign({}, openGraph), { title: resolveTitle(openGraph.title, titleTemplate) });
    resolveProps(resolved, openGraph);
    resolved.url = openGraph.url
        ? resolveAbsoluteUrlWithPathname(openGraph.url, metadataBase, metadataContext)
        : null;
    return resolved;
};
const TwitterBasicInfoKeys = [
    'site',
    'siteId',
    'creator',
    'creatorId',
    'description',
];
export const resolveTwitter = (twitter, metadataBase, titleTemplate) => {
    var _a;
    if (!twitter)
        return null;
    let card = 'card' in twitter ? twitter.card : undefined;
    const resolved = Object.assign(Object.assign({}, twitter), { title: resolveTitle(twitter.title, titleTemplate) });
    for (const infoKey of TwitterBasicInfoKeys) {
        resolved[infoKey] = twitter[infoKey] || null;
    }
    resolved.images = resolveImages(twitter.images, metadataBase);
    card = card || (((_a = resolved.images) === null || _a === void 0 ? void 0 : _a.length) ? 'summary_large_image' : 'summary');
    resolved.card = card;
    if ('card' in resolved) {
        switch (resolved.card) {
            case 'player': {
                resolved.players = resolveAsArrayOrUndefined(resolved.players) || [];
                break;
            }
            case 'app': {
                resolved.app = resolved.app || {};
                break;
            }
            default:
                break;
        }
    }
    return resolved;
};
