"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberButtonGroup = CyberButtonGroup;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberButtonGroup({ children, cornerSize = 8, className = '', }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: `inline-flex border border-[#10ff50]/20 ${className}`, style: {
            clipPath: `polygon(${cornerSize}px 0, 100% 0, 100% calc(100% - ${cornerSize}px), calc(100% - ${cornerSize}px) 100%, 0 100%, 0 ${cornerSize}px)`,
        }, children: children }));
}
