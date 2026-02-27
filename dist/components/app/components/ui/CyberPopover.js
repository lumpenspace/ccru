"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberPopover = CyberPopover;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
function CyberPopover({ trigger, content }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [pos, setPos] = (0, react_1.useState)({ x: 0, y: 0 });
    const canRenderPortal = typeof document !== 'undefined';
    const popover = (0, react_1.useMemo)(() => {
        if (!open || !canRenderPortal)
            return null;
        return (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)("div", { className: "fixed z-[120] max-w-[320px] px-2 py-1.5 text-[11px] leading-relaxed", style: {
                left: pos.x,
                top: pos.y,
                transform: 'translateY(-50%)',
                border: '1px solid rgba(16,255,80,0.35)',
                background: 'linear-gradient(180deg, rgba(8,12,20,0.96) 0%, rgba(4,7,13,0.96) 100%)',
                color: '#9ca3af',
                boxShadow: '0 0 14px rgba(16,255,80,0.15)',
            }, children: content }), document.body);
    }, [canRenderPortal, content, open, pos.x, pos.y]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { className: "inline-flex", onMouseEnter: e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPos({ x: rect.right + 10, y: rect.top + rect.height / 2 });
                    setOpen(true);
                }, onMouseLeave: () => setOpen(false), children: trigger }), popover] }));
}
