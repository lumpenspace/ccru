"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberCheckbox = CyberCheckbox;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberCheckbox({ checked, label, onChange, disabled = false, icon, accent = '#10ff50', className = '', }) {
    const borderActive = checked ? accent : 'rgba(75,85,99,0.55)';
    const checkedBackground = `color-mix(in srgb, ${accent} 10%, rgba(10,14,20,0.9))`;
    const textColor = checked ? accent : '#94a3b8';
    return ((0, jsx_runtime_1.jsxs)("label", { className: `inline-flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`, style: {
            border: `1px solid ${borderActive}`,
            background: checked ? checkedBackground : 'rgba(10,14,20,0.5)',
            clipPath: 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)',
            transition: 'all 0.15s ease',
        }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: checked, onChange: onChange, disabled: disabled, className: "sr-only" }), icon && ((0, jsx_runtime_1.jsx)("span", { className: "inline-flex min-w-[16px] items-center justify-center text-[11px]", style: { color: textColor }, children: icon })), (0, jsx_runtime_1.jsx)("span", { style: { color: textColor }, children: label }), (0, jsx_runtime_1.jsx)("span", { className: "ml-auto h-1.5 w-1.5 rounded-full", style: {
                    border: `1px solid ${checked ? accent : '#4b5563'}`,
                    background: checked ? accent : 'transparent',
                    boxShadow: checked ? `0 0 6px ${accent}aa` : 'none',
                } })] }));
}
