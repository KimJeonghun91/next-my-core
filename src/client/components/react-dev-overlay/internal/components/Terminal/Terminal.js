import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Anser from 'next/dist/compiled/anser';
import * as React from 'react';
import { HotlinkedText } from '../hot-linked-text';
import { EditorLink } from './EditorLink';
function getFile(lines) {
    const contentFileName = lines.shift();
    if (!contentFileName)
        return null;
    const [fileName, line, column] = contentFileName.split(':', 3);
    const parsedLine = Number(line);
    const parsedColumn = Number(column);
    const hasLocation = !Number.isNaN(parsedLine) && !Number.isNaN(parsedColumn);
    return {
        fileName: hasLocation ? fileName : contentFileName,
        location: hasLocation
            ? {
                line: parsedLine,
                column: parsedColumn,
            }
            : undefined,
    };
}
function getImportTraceFiles(lines) {
    if (lines.some((line) => /ReactServerComponentsError:/.test(line)) ||
        lines.some((line) => /Import trace for requested module:/.test(line))) {
        // Grab the lines at the end containing the files
        const files = [];
        while (/.+\..+/.test(lines[lines.length - 1]) &&
            !lines[lines.length - 1].includes(':')) {
            const file = lines.pop().trim();
            files.unshift(file);
        }
        return files;
    }
    return [];
}
function getEditorLinks(content) {
    const lines = content.split('\n');
    const file = getFile(lines);
    const importTraceFiles = getImportTraceFiles(lines);
    return { file, source: lines.join('\n'), importTraceFiles };
}
export const Terminal = function Terminal({ content, }) {
    const { file, source, importTraceFiles } = React.useMemo(() => getEditorLinks(content), [content]);
    const decoded = React.useMemo(() => {
        return Anser.ansiToJson(source, {
            json: true,
            use_classes: true,
            remove_empty: true,
        });
    }, [source]);
    return (_jsxs("div", { "data-nextjs-terminal": true, children: [file && (_jsx(EditorLink, { isSourceFile: true, file: file.fileName, location: file.location }, file.fileName)), _jsxs("pre", { children: [decoded.map((entry, index) => (_jsx("span", { style: Object.assign({ color: entry.fg ? `var(--color-${entry.fg})` : undefined }, (entry.decoration === 'bold'
                            ? { fontWeight: 800 }
                            : entry.decoration === 'italic'
                                ? { fontStyle: 'italic' }
                                : undefined)), children: _jsx(HotlinkedText, { text: entry.content }) }, `terminal-entry-${index}`))), importTraceFiles.map((importTraceFile) => (_jsx(EditorLink, { isSourceFile: false, file: importTraceFile }, importTraceFile)))] })] }));
};
