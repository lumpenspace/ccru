"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeonDivider = NeonDivider;
const jsx_runtime_1 = require("react/jsx-runtime");
function NeonDivider({ color = '#10ff50' }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "my-1.5 h-[1px] relative", children: (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0", style: {
                background: `linear-gradient(90deg, transparent 0%, ${color}44 20%, ${color}22 80%, transparent 100%)`,
            } }) }));
}
