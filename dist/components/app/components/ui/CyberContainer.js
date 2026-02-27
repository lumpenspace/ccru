"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberContainer = CyberContainer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const CyberPanelHeader_1 = require("./CyberPanelHeader");
function CyberContainer({ title, children, draggable = false, collapsible = false, defaultOpen = true, defaultPosition = { x: 0, y: 0 }, width = 280, className = '', }) {
    const [open, setOpen] = (0, react_1.useState)(defaultOpen);
    const [pos, setPos] = (0, react_1.useState)(defaultPosition);
    const [dragging, setDragging] = (0, react_1.useState)(false);
    const dragOffsetRef = (0, react_1.useRef)({ x: 0, y: 0 });
    (0, react_1.useEffect)(() => {
        if (!dragging)
            return;
        const onMove = (e) => {
            setPos({
                x: e.clientX - dragOffsetRef.current.x,
                y: e.clientY - dragOffsetRef.current.y,
            });
        };
        const onUp = () => setDragging(false);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging]);
    return ((0, jsx_runtime_1.jsxs)("section", { className: `relative border border-[#10ff50]/20 bg-[#0b111a] ${className}`, style: {
            width,
            position: draggable ? 'absolute' : 'relative',
            left: draggable ? pos.x : undefined,
            top: draggable ? pos.y : undefined,
        }, children: [(0, jsx_runtime_1.jsx)(CyberPanelHeader_1.CyberPanelHeader, { title: title, className: "border-b border-[#10ff50]/15 px-2.5 py-2", titleClassName: "text-[10px] uppercase tracking-[0.16em] text-[#10ff50]", style: { cursor: draggable ? 'grab' : 'default' }, onMouseDown: e => {
                    if (!draggable)
                        return;
                    const rect = e.currentTarget.parentElement.getBoundingClientRect();
                    dragOffsetRef.current = {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    };
                    setDragging(true);
                }, rightSlot: collapsible ? ((0, jsx_runtime_1.jsx)("button", { type: "button", className: "text-xs text-gray-400", onMouseDown: e => e.stopPropagation(), onClick: () => setOpen(v => !v), children: open ? '▾' : '▸' })) : undefined }), (!collapsible || open) && ((0, jsx_runtime_1.jsx)("div", { className: "px-2.5 py-2", children: children }))] }));
}
