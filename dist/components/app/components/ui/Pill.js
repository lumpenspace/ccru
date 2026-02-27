"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pill = Pill;
const jsx_runtime_1 = require("react/jsx-runtime");
function Pill({ children, accent, onClose, closeLabel = 'Remove', className = '', title, }) {
    return ((0, jsx_runtime_1.jsxs)("span", { className: `inline-flex items-center justify-center gap-1 rounded-full border border-[#334155] bg-[#0b111a] px-1.5 py-[2px] text-[10px] leading-none text-gray-200 ${className}`, style: accent
            ? {
                color: accent,
                borderColor: `${accent}88`,
                background: `${accent}1a`,
            }
            : undefined, title: title, children: [(0, jsx_runtime_1.jsx)("span", { children: children }), onClose && ((0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": closeLabel, className: "rounded border border-transparent px-0.5 text-[9px] leading-none text-inherit opacity-80 transition hover:opacity-100", onClick: event => {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                }, children: "x" }))] }));
}
