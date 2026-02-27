"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberPanelHeader = CyberPanelHeader;
const jsx_runtime_1 = require("react/jsx-runtime");
function CyberPanelHeader({ title, leftSlot, rightSlot, className = '', titleClassName = 'text-[10px] uppercase tracking-[0.16em] text-gray-400', onMouseDown, onClick, onKeyDown, role, tabIndex, ariaExpanded, style, }) {
    return ((0, jsx_runtime_1.jsxs)("header", { className: `flex w-full items-center gap-2 ${className}`, onMouseDown: onMouseDown, onClick: onClick, onKeyDown: onKeyDown, role: role, tabIndex: tabIndex, "aria-expanded": ariaExpanded, style: style, children: [leftSlot, (0, jsx_runtime_1.jsx)("span", { className: titleClassName, children: title }), rightSlot && ((0, jsx_runtime_1.jsx)("div", { className: "ml-auto flex items-center gap-1", children: rightSlot }))] }));
}
