var LocationType;
(function (LocationType) {
    LocationType["FILE"] = "file";
    LocationType["WEBPACK_INTERNAL"] = "webpack-internal";
    LocationType["HTTP"] = "http";
    LocationType["PROTOCOL_RELATIVE"] = "protocol-relative";
    LocationType["UNKNOWN"] = "unknown";
})(LocationType || (LocationType = {}));
/**
 * Get the type of frame line based on the location
 */
function getLocationType(location) {
    if (location.startsWith('file://')) {
        return LocationType.FILE;
    }
    if (location.startsWith('webpack-internal://')) {
        return LocationType.WEBPACK_INTERNAL;
    }
    if (location.startsWith('http://') || location.startsWith('https://')) {
        return LocationType.HTTP;
    }
    if (location.startsWith('//')) {
        return LocationType.PROTOCOL_RELATIVE;
    }
    return LocationType.UNKNOWN;
}
function parseStackFrameLocation(location) {
    var _a;
    const locationType = getLocationType(location);
    const modulePath = location === null || location === void 0 ? void 0 : location.replace(/^(webpack-internal:\/\/\/|file:\/\/)(\(.*\)\/)?/, '');
    const [, file, lineNumber, column] = (_a = modulePath === null || modulePath === void 0 ? void 0 : modulePath.match(/^(.+):(\d+):(\d+)/)) !== null && _a !== void 0 ? _a : [];
    switch (locationType) {
        case LocationType.FILE:
        case LocationType.WEBPACK_INTERNAL:
            return {
                canOpenInEditor: true,
                file,
                lineNumber: lineNumber ? Number(lineNumber) : undefined,
                column: column ? Number(column) : undefined,
            };
        // When the location is a URL we only show the file
        // TODO: Resolve http(s) URLs through sourcemaps
        case LocationType.HTTP:
        case LocationType.PROTOCOL_RELATIVE:
        case LocationType.UNKNOWN:
        default: {
            return {
                canOpenInEditor: false,
            };
        }
    }
}
export function parseComponentStack(componentStack) {
    const componentStackFrames = [];
    for (const line of componentStack.trim().split('\n')) {
        // Get component and file from the component stack line
        const match = /at ([^ ]+)( \((.*)\))?/.exec(line);
        if (match === null || match === void 0 ? void 0 : match[1]) {
            const component = match[1];
            const location = match[3];
            if (!location) {
                componentStackFrames.push({
                    canOpenInEditor: false,
                    component,
                });
                continue;
            }
            // Stop parsing the component stack if we reach a Next.js component
            if (location === null || location === void 0 ? void 0 : location.includes('next/dist')) {
                break;
            }
            const frameLocation = parseStackFrameLocation(location);
            componentStackFrames.push(Object.assign({ component }, frameLocation));
        }
    }
    return componentStackFrames;
}
