"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberGridGroup = CyberGridGroup;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberGridGroup({ children, className = '', columns = 2, }) {
    const colClass = columns === 4
        ? 'md:grid-cols-4'
        : columns === 3
            ? 'md:grid-cols-3'
            : 'md:grid-cols-2';
    return ((0, jsx_runtime_1.jsx)("div", { className: `grid grid-cols-1 gap-3 ${colClass} ${className}`, children: children }));
}
