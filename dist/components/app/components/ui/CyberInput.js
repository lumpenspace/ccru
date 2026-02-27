"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberInput = CyberInput;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberInput({ label, value, onChange, placeholder }) {
    return ((0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)("span", { className: "mb-1 block text-[10px] uppercase tracking-[0.12em] text-gray-400", children: label }), (0, jsx_runtime_1.jsx)("span", { className: "ui-terminal-field", children: (0, jsx_runtime_1.jsx)("input", { value: value, onChange: e => onChange(e.target.value), placeholder: placeholder, className: "ui-terminal-input w-full px-0 py-2 text-sm text-gray-100" }) })] }));
}
