"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRow = DataRow;
const jsx_runtime_1 = require("react/jsx-runtime");
function DataRow({ label, value, color = '#10ff50' }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5 text-[9px] font-mono", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-[2px] h-2.5 flex-shrink-0", style: { background: `${color}66` } }), (0, jsx_runtime_1.jsx)("span", { className: "tracking-[0.12em] uppercase text-gray-600 flex-shrink-0", style: { fontSize: 8 }, children: label }), (0, jsx_runtime_1.jsx)("span", { className: "flex-1 text-gray-700 overflow-hidden", style: { fontSize: 7, letterSpacing: '0.15em' }, children: '·'.repeat(30) }), (0, jsx_runtime_1.jsx)("span", { style: { color: `${color}cc` }, children: value })] }));
}
