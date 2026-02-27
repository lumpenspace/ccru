"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberPageHeader = CyberPageHeader;
const jsx_runtime_1 = require("react/jsx-runtime");
const HomeLink_1 = require("./HomeLink");
function CyberPageHeader({ title, description, icon, className = '', homeHref = '/', homeLabel = 'Home', showHomeLink = true, actions, }) {
    return ((0, jsx_runtime_1.jsxs)("header", { className: `flex items-stretch gap-2 ${className}`, children: [showHomeLink && ((0, jsx_runtime_1.jsx)("div", { className: "flex shrink-0 items-center px-1.5", style: {
                    border: '1px solid rgba(16,255,80,0.16)',
                    background: 'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
                }, children: (0, jsx_runtime_1.jsx)(HomeLink_1.HomeLink, { href: homeHref, label: homeLabel, boxed: false }) })), (0, jsx_runtime_1.jsx)("div", { className: "min-w-0 flex-1 px-2.5 py-1.5", style: {
                    border: '1px solid rgba(16,255,80,0.16)',
                    background: 'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
                }, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 min-w-0", children: [icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        (0, jsx_runtime_1.jsx)("img", { src: icon, alt: "", className: "w-4 h-4", style: { filter: 'drop-shadow(0 0 3px rgba(16,255,80,0.4))' } })), (0, jsx_runtime_1.jsx)("span", { className: "text-[9px] tracking-[0.28em] uppercase whitespace-nowrap", style: { color: '#10ff50', textShadow: '0 0 6px rgba(16,255,80,0.3)' }, children: title }), description && ((0, jsx_runtime_1.jsx)("span", { className: "text-[9px] tracking-[0.06em] text-gray-500 truncate hidden sm:inline", children: description }))] }) }), actions && ((0, jsx_runtime_1.jsx)("div", { className: "flex shrink-0 items-center px-1.5", style: {
                    border: '1px solid rgba(16,255,80,0.16)',
                    background: 'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
                }, children: actions }))] }));
}
