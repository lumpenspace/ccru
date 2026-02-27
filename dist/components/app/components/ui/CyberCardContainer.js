"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberCardContainer = CyberCardContainer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const CyberPanelHeader_1 = require("./CyberPanelHeader");
function CyberCardContainer({ title, children, className = '', collapsible = false, defaultOpen = true, }) {
    const [open, setOpen] = (0, react_1.useState)(defaultOpen);
    const toggleOpen = () => setOpen(v => !v);
    return ((0, jsx_runtime_1.jsxs)("section", { className: `border border-[#334155] bg-[#0a1018] ${className}`, children: [(0, jsx_runtime_1.jsx)(CyberPanelHeader_1.CyberPanelHeader, { title: title, className: `border-b border-[#334155] px-3 py-2 ${collapsible ? 'cursor-pointer select-none' : ''}`, onClick: collapsible ? toggleOpen : undefined, onKeyDown: collapsible ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleOpen();
                    }
                } : undefined, role: collapsible ? 'button' : undefined, tabIndex: collapsible ? 0 : undefined, ariaExpanded: collapsible ? open : undefined, rightSlot: collapsible ? ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-400", "aria-hidden": "true", children: open ? '▾' : '▸' })) : undefined }), (!collapsible || open) && ((0, jsx_runtime_1.jsx)("div", { className: "px-3 py-3", children: children }))] }));
}
