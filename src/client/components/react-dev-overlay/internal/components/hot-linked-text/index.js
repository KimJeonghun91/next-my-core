import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { getWordsAndWhitespaces } from './get-words-and-whitespaces';
const linkRegex = /https?:\/\/[^\s/$.?#].[^\s"]*/i;
export const HotlinkedText = function HotlinkedText(props) {
    const { text } = props;
    const wordsAndWhitespaces = getWordsAndWhitespaces(text);
    return (_jsx(_Fragment, { children: linkRegex.test(text)
            ? wordsAndWhitespaces.map((word, index) => {
                if (linkRegex.test(word)) {
                    return (_jsx(React.Fragment, { children: _jsx("a", { href: word, children: word }) }, `link-${index}`));
                }
                return _jsx(React.Fragment, { children: word }, `text-${index}`);
            })
            : text }));
};
