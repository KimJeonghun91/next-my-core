export function searchParamsToUrlQuery(searchParams) {
    const query = {};
    searchParams.forEach((value, key) => {
        if (typeof query[key] === 'undefined') {
            query[key] = value;
        }
        else if (Array.isArray(query[key])) {
            ;
            query[key].push(value);
        }
        else {
            query[key] = [query[key], value];
        }
    });
    return query;
}
function stringifyUrlQueryParam(param) {
    if (typeof param === 'string' ||
        (typeof param === 'number' && !isNaN(param)) ||
        typeof param === 'boolean') {
        return String(param);
    }
    else {
        return '';
    }
}
export function urlQueryToSearchParams(urlQuery) {
    const result = new URLSearchParams();
    Object.entries(urlQuery).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => result.append(key, stringifyUrlQueryParam(item)));
        }
        else {
            result.set(key, stringifyUrlQueryParam(value));
        }
    });
    return result;
}
export function assign(target, ...searchParamsList) {
    searchParamsList.forEach((searchParams) => {
        Array.from(searchParams.keys()).forEach((key) => target.delete(key));
        searchParams.forEach((value, key) => target.append(key, value));
    });
    return target;
}
