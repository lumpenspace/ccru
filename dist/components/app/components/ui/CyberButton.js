"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberButton = CyberButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function CyberButton({ onClick, active = false, indicator = false, disabled = false, shortcut, size = 'md', onMouseEnter, onMouseLeave, className = '', children, }) {
    const buttonRef = (0, react_1.useRef)(null);
    const shortcutKey = (0, react_1.useMemo)(() => (shortcut || '').trim().toLowerCase(), [shortcut]);
    (0, react_1.useEffect)(() => {
        if (!shortcutKey || !onClick || disabled)
            return;
        const isTypingTarget = (target) => {
            const el = target;
            if (!el)
                return false;
            if (el.isContentEditable)
                return true;
            const tag = el.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        };
        const onKeyDown = (e) => {
            if (e.defaultPrevented)
                return;
            if (e.repeat)
                return;
            if (e.metaKey || e.ctrlKey || e.altKey)
                return;
            if (isTypingTarget(e.target))
                return;
            if (e.key.toLowerCase() !== shortcutKey)
                return;
            const btn = buttonRef.current;
            if (!btn || btn.disabled)
                return;
            if (btn.getClientRects().length === 0)
                return;
            if (window.getComputedStyle(btn).visibility === 'hidden')
                return;
            e.preventDefault();
            btn.click();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [shortcutKey, onClick, disabled]);
    const sizeClass = size === 'sm'
        ? 'px-2 py-1 text-[10px] tracking-[0.1em]'
        : 'px-2.5 py-2 text-[11px] tracking-[0.12em]';
    return ((0, jsx_runtime_1.jsxs)("button", { ref: buttonRef, type: "button", onClick: onClick, disabled: disabled, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, className: `relative uppercase transition-all ${sizeClass} ${active ? 'bg-[#10ff50]/[0.08]' : 'bg-transparent hover:bg-white/[0.03]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`, style: active ? { boxShadow: 'inset 0 -1px 0 rgba(16,255,80,0.4)' } : undefined, children: [shortcutKey && ((0, jsx_runtime_1.jsx)("span", { className: "pointer-events-none absolute right-1 top-0.5 text-[7px] leading-none", style: { color: active ? '#10ff50' : '#6b7280' }, children: shortcutKey.toUpperCase() })), indicator && active && ((0, jsx_runtime_1.jsx)("span", { className: `absolute top-1 h-1.5 w-1.5 rounded-full bg-green-400/80 ${shortcutKey ? 'right-4' : 'right-1'}` })), children] }));
}
