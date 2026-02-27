"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberCodeBlock = CyberCodeBlock;
const jsx_runtime_1 = require("react/jsx-runtime");
const prism_react_renderer_1 = require("prism-react-renderer");
function CyberCodeBlock({ code, language = 'tsx', className = '', }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: `overflow-auto border border-[#1e293b] bg-[#050a11] ${className}`, children: (0, jsx_runtime_1.jsx)(prism_react_renderer_1.Highlight, { code: code.trim(), language: language, theme: prism_react_renderer_1.themes.vsDark, children: ({ className: prismClassName, style, tokens, getLineProps, getTokenProps }) => ((0, jsx_runtime_1.jsx)("pre", { className: `m-0 p-3 text-[12px] leading-5 ${prismClassName}`, style: { ...style, background: 'transparent' }, children: tokens.map((line, lineIndex) => ((0, jsx_runtime_1.jsx)("div", { ...getLineProps({ line }), children: line.map((token, tokenIndex) => ((0, jsx_runtime_1.jsx)("span", { ...getTokenProps({ token }) }, tokenIndex))) }, lineIndex))) })) }) }));
}
