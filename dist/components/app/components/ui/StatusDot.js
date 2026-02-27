"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusDot = StatusDot;
const jsx_runtime_1 = require("react/jsx-runtime");
function StatusDot({ color, pulse = true, className = '' }) {
    return ((0, jsx_runtime_1.jsx)("span", { className: `inline-block w-[5px] h-[5px] rounded-full flex-shrink-0 ${className}`, style: {
            background: color,
            boxShadow: `0 0 4px ${color}88`,
            animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : undefined,
        } }));
}
