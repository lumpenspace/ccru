"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlitchTransition = GlitchTransition;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function GlitchTransition({ value, className = '' }) {
    const [glitching, setGlitching] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setGlitching(true);
        const timer = window.setTimeout(() => setGlitching(false), 240);
        return () => window.clearTimeout(timer);
    }, [value]);
    return ((0, jsx_runtime_1.jsx)("span", { className: `${glitching ? 'ui-glitch-transition' : ''} ${className}`, children: value }));
}
