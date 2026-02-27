"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionFrame = SectionFrame;
const jsx_runtime_1 = require("react/jsx-runtime");
function SectionFrame({ title, color = '#10ff50', children }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative pl-2 py-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute top-0 left-0 w-2 h-[1px]", style: { background: `${color}55` } }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-0 left-0 w-[1px] h-2", style: { background: `${color}55` } }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-0 right-0 w-2 h-[1px]", style: { background: `${color}22` } }), (0, jsx_runtime_1.jsx)("div", { className: "absolute bottom-0 right-0 w-[1px] h-2", style: { background: `${color}22` } }), title && ((0, jsx_runtime_1.jsx)("div", { className: "text-[7px] tracking-[0.2em] uppercase mb-1", style: { color: `${color}88` }, children: title })), children] }));
}
