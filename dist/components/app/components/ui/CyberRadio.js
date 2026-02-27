"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberRadio = CyberRadio;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberRadio({ checked, label, onChange, name, disabled = false, }) {
    return ((0, jsx_runtime_1.jsxs)("label", { className: `inline-flex cursor-pointer items-center gap-2 text-xs tracking-[0.12em] uppercase ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`, children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", name: name, checked: checked, onChange: onChange, disabled: disabled, className: "sr-only" }), (0, jsx_runtime_1.jsx)("span", { className: "flex h-3.5 w-3.5 items-center justify-center rounded-full border", style: {
                    borderColor: checked ? 'rgba(16,255,80,0.7)' : 'rgba(107,114,128,0.7)',
                    boxShadow: checked ? '0 0 8px rgba(16,255,80,0.3)' : 'none',
                }, children: checked && (0, jsx_runtime_1.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-[#10ff50]" }) }), (0, jsx_runtime_1.jsx)("span", { style: { color: checked ? '#10ff50' : '#9ca3af' }, children: label })] }));
}
