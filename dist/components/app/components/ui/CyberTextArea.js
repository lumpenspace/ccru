"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyberTextArea = CyberTextArea;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Pill_1 = require("./Pill");
function parseNumericPills(raw) {
    const matches = `${raw || ''}`.match(/-?\d+/g);
    if (!matches)
        return [];
    return matches
        .map(chunk => Number(chunk))
        .filter(entry => Number.isFinite(entry));
}
function serializeNumericPills(values) {
    return values.join(', ');
}
function CyberTextArea({ label, value, onChange, rows = 6, placeholder, pillCollection = false, }) {
    const [draft, setDraft] = (0, react_1.useState)('');
    const pills = (0, react_1.useMemo)(() => (pillCollection ? parseNumericPills(value) : []), [pillCollection, value]);
    const removePill = (index) => {
        const next = pills.filter((_, pillIndex) => pillIndex !== index);
        onChange(serializeNumericPills(next));
    };
    const appendPills = (0, react_1.useCallback)((raw) => {
        const nextValues = parseNumericPills(raw);
        if (nextValues.length === 0)
            return false;
        onChange(serializeNumericPills([...pills, ...nextValues]));
        return true;
    }, [onChange, pills]);
    const commitDraft = (0, react_1.useCallback)(() => {
        appendPills(draft);
        setDraft('');
    }, [appendPills, draft]);
    if (pillCollection) {
        return ((0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)("span", { className: "mb-1 block text-[10px] uppercase tracking-[0.12em] text-gray-400", children: label }), (0, jsx_runtime_1.jsxs)("span", { className: "ui-pill-input-field", children: [(0, jsx_runtime_1.jsx)("span", { className: "ui-pill-input-list", children: pills.map((pill, index) => ((0, jsx_runtime_1.jsx)(Pill_1.Pill, { onClose: () => removePill(index), closeLabel: `Remove ${pill}`, className: "border-[#374151] bg-[#111827] px-2 py-1 text-[11px] text-gray-100", children: pill }, `${pill}-${index}`))) }), (0, jsx_runtime_1.jsx)("input", { value: draft, onChange: event => {
                                const next = event.target.value;
                                if (/[,\s]/.test(next)) {
                                    appendPills(next);
                                    setDraft('');
                                    return;
                                }
                                setDraft(next);
                            }, onKeyDown: event => {
                                if (event.key === 'Backspace' && draft.length === 0 && pills.length > 0) {
                                    event.preventDefault();
                                    removePill(pills.length - 1);
                                    return;
                                }
                                if (event.key === 'Enter' || event.key === 'Tab' || event.key === ',' || event.key === ' ') {
                                    event.preventDefault();
                                    commitDraft();
                                }
                            }, onBlur: commitDraft, onPaste: event => {
                                const pasted = event.clipboardData.getData('text');
                                const parsed = parseNumericPills(pasted);
                                if (parsed.length === 0)
                                    return;
                                event.preventDefault();
                                onChange(serializeNumericPills([...pills, ...parsed]));
                                setDraft('');
                            }, placeholder: placeholder, className: "ui-pill-input-entry" })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("label", { className: "block", children: [(0, jsx_runtime_1.jsx)("span", { className: "mb-1 block text-[10px] uppercase tracking-[0.12em] text-gray-400", children: label }), (0, jsx_runtime_1.jsx)("span", { className: "ui-terminal-field ui-terminal-field-area", children: (0, jsx_runtime_1.jsx)("textarea", { value: value, onChange: e => onChange(e.target.value), rows: rows, placeholder: placeholder, className: "ui-terminal-input ui-terminal-area w-full resize-y px-0 py-2 text-sm leading-6 text-gray-100" }) })] }));
}
