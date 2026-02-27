"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Figure = Figure;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const xenotation_1 = require("../../lib/xenotation");
function formatFigureValue(value, system) {
    if (!Number.isFinite(value))
        return String(value);
    const integer = Number.isInteger(value);
    if (system === 'decimal')
        return integer ? value.toLocaleString() : String(value);
    if (system === 'binary') {
        if (!integer)
            return String(value);
        const sign = value < 0 ? '-' : '';
        return `${sign}${Math.abs(value).toString(2)}`;
    }
    if (!integer)
        return String(value);
    if (value === 0)
        return '0';
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    const xeno = (0, xenotation_1.formatXenotationForDisplay)(abs);
    return `${sign}${xeno || abs.toLocaleString()}`;
}
function displaySystemLabel(system) {
    if (system === 'binary')
        return 'bin';
    if (system === 'tic-xenotation')
        return 'tic';
    return 'dec';
}
function Figure({ title, value, accent = '#10ff50', className = '', size = 'md', align = 'left', showDisplaySystem = false, displaySystem = 'decimal', restDisplaySystem, hoverDisplaySystem, }) {
    const [hovered, setHovered] = (0, react_1.useState)(false);
    const isNumeric = typeof value === 'number';
    const restSystem = restDisplaySystem !== null && restDisplaySystem !== void 0 ? restDisplaySystem : displaySystem;
    const hoverSystem = hoverDisplaySystem !== null && hoverDisplaySystem !== void 0 ? hoverDisplaySystem : restSystem;
    const activeSystem = hovered ? hoverSystem : restSystem;
    const showSystemBadge = showDisplaySystem && isNumeric && (restSystem !== 'decimal' || hoverSystem !== restSystem);
    const isSmall = size === 'sm';
    const centered = align === 'center';
    const renderedValue = (0, react_1.useMemo)(() => {
        if (!isNumeric)
            return value;
        return formatFigureValue(value, activeSystem);
    }, [activeSystem, isNumeric, value]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `border ${isSmall ? 'px-2 py-1.5' : 'px-2.5 py-2'} ${className}`, style: {
            borderColor: `${accent}4d`,
            background: `${accent}11`,
        }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: [(0, jsx_runtime_1.jsxs)("div", { className: `flex items-start gap-2 ${centered && !showSystemBadge ? 'justify-center' : 'justify-between'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `${isSmall ? 'text-[9px]' : 'text-[10px]'} uppercase tracking-[0.14em] ${centered ? 'text-center' : ''}`, style: { color: `${accent}cc` }, children: title }), showSystemBadge && ((0, jsx_runtime_1.jsx)("div", { className: `${isSmall ? 'text-[8px]' : 'text-[9px]'} uppercase tracking-[0.14em] text-gray-500`, children: displaySystemLabel(activeSystem) }))] }), (0, jsx_runtime_1.jsx)("div", { className: `${isSmall ? 'mt-0.5 text-sm' : 'mt-1 text-base'} font-semibold leading-none text-gray-100 ${centered ? 'text-center' : ''}`, children: renderedValue })] }));
}
