"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberStackGroup = CyberStackGroup;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberStackGroup({ children, className = '' }) {
    return (0, jsx_runtime_1.jsx)("div", { className: `space-y-3 ${className}`, children: children });
}
