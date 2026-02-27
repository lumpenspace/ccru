"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlitchText = GlitchText;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:<>?/~';
function GlitchText({ text, color = '#10ff50', className = '' }) {
    const [display, setDisplay] = (0, react_1.useState)(text);
    const frameRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        const start = performance.now();
        const duration = 180;
        const target = text.split('');
        const tick = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(1, elapsed / duration);
            const resolvedCount = Math.floor(progress * target.length);
            const next = target.map((char, index) => {
                if (index < resolvedCount)
                    return char;
                return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }).join('');
            setDisplay(next);
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
        };
        frameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameRef.current);
    }, [text]);
    return ((0, jsx_runtime_1.jsx)("span", { className: `ui-glitch-text font-bold uppercase tracking-[0.12em] text-xs ${className}`, style: {
            color,
            textShadow: `0 0 8px ${color}66, 0 0 20px ${color}22`,
        }, children: display }));
}
