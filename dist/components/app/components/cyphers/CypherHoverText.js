"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypherHoverText = CypherHoverText;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const Pill_1 = require("../ui/Pill");
const NUMBER_CODES = new Set([48, 49, 50, 51, 52, 53, 54, 55, 56, 57]);
const DOT_PLACEHOLDER = '\uE000';
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
function protectDotTokens(text, regex) {
    return text.replace(regex, rawMatch => {
        var _a;
        const trailing = ((_a = rawMatch.match(/[.!?]+$/)) === null || _a === void 0 ? void 0 : _a[0]) || '';
        const token = trailing ? rawMatch.slice(0, -trailing.length) : rawMatch;
        return token.replace(/\./g, DOT_PLACEHOLDER) + trailing;
    });
}
function splitSentences(text) {
    const protectedText = protectDotTokens(protectDotTokens(text, URL_RE), EMAIL_RE);
    const matches = protectedText.match(/[^.!?]+[.!?]*/g);
    if (!matches) {
        return [text].filter(part => part.trim().length > 0);
    }
    return matches
        .map(part => part.replaceAll(DOT_PLACEHOLDER, '.'))
        .filter(part => part.trim().length > 0);
}
function stripInlineMarkdown(text) {
    return text
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1');
}
function renderInlineMarkdown(text, keyPrefix) {
    const nodes = [];
    const tokenRe = /(\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|__(.+?)__|`(.+?)`|\*(.+?)\*|_(.+?)_)/g;
    let last = 0;
    let match;
    while ((match = tokenRe.exec(text)) !== null) {
        const start = match.index;
        if (start > last) {
            nodes.push(text.slice(last, start));
        }
        if (match[1].startsWith('[')) {
            const label = match[2];
            const href = match[3];
            nodes.push((0, jsx_runtime_1.jsx)("a", { href: href, target: "_blank", rel: "noreferrer noopener", className: "underline decoration-dotted underline-offset-2", onClick: e => e.stopPropagation(), children: label }, `${keyPrefix}-link-${start}`));
        }
        else if (match[4] || match[5]) {
            nodes.push((0, jsx_runtime_1.jsx)("strong", { className: "font-semibold text-gray-100", children: match[4] || match[5] }, `${keyPrefix}-strong-${start}`));
        }
        else if (match[6]) {
            nodes.push((0, jsx_runtime_1.jsx)("code", { className: "rounded border border-[#334155] bg-[#0b111a] px-1 py-[1px] text-[0.9em]", children: match[6] }, `${keyPrefix}-code-${start}`));
        }
        else {
            nodes.push((0, jsx_runtime_1.jsx)("em", { className: "italic text-gray-200", children: match[7] || match[8] }, `${keyPrefix}-em-${start}`));
        }
        last = tokenRe.lastIndex;
    }
    if (last < text.length) {
        nodes.push(text.slice(last));
    }
    return nodes;
}
function normalizeMarkdownInput(markdown) {
    return markdown
        .replace(/\r\n?/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n');
}
function fromMarkdown(markdown) {
    return normalizeMarkdownInput(markdown)
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(text => ({
        text,
        sentences: splitSentences(text),
    }));
}
function fromMarkup(markup) {
    if (typeof window !== 'undefined' && 'DOMParser' in window) {
        const doc = new window.DOMParser().parseFromString(markup, 'text/html');
        const pNodes = Array.from(doc.querySelectorAll('p'));
        if (pNodes.length > 0) {
            return pNodes
                .map(node => (node.textContent || '').replace(/\s+/g, ' ').trim())
                .filter(Boolean)
                .map(text => ({ text, sentences: splitSentences(text) }));
        }
        const plain = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
        if (!plain)
            return [];
        return [{ text: plain, sentences: splitSentences(plain) }];
    }
    const plain = markup
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!plain)
        return [];
    return [{ text: plain, sentences: splitSentences(plain) }];
}
function calcForCypher(text, cypher) {
    let prepared = text.replace(/\[.+\]/g, '').trim();
    if (cypher.diacriticsAsRegular !== false) {
        prepared = prepared.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    if (cypher.caseSensitive !== true)
        prepared = prepared.toLowerCase();
    const valueMap = new Map();
    for (let i = 0; i < cypher.chars.length; i++) {
        valueMap.set(cypher.chars.charCodeAt(i), cypher.values[i]);
    }
    let sum = 0;
    for (let i = 0; i < prepared.length; i++) {
        const code = prepared.charCodeAt(i);
        const value = valueMap.get(code);
        if (value !== undefined)
            sum += value;
    }
    if (!valueMap.has(49)) {
        let curNum = '';
        for (let i = 0; i < prepared.length; i++) {
            const code = prepared.charCodeAt(i);
            if (NUMBER_CODES.has(code)) {
                curNum += String(code - 48);
            }
            else if (curNum.length > 0 && code !== 44) {
                sum += Number(curNum);
                curNum = '';
            }
        }
        if (curNum.length > 0)
            sum += Number(curNum);
    }
    return sum;
}
function cypherAccent(cypher) {
    if (typeof cypher.hue === 'number' &&
        typeof cypher.saturation === 'number' &&
        typeof cypher.lightness === 'number') {
        return `hsl(${cypher.hue} ${cypher.saturation}% ${cypher.lightness}%)`;
    }
    return '#10ff50';
}
function splitIntoBalancedLines(items) {
    if (items.length <= 6)
        return [items];
    const midpoint = Math.ceil(items.length / 2);
    return [items.slice(0, midpoint), items.slice(midpoint)];
}
function CypherHoverText({ cyphers, markdown, markup, className = '' }) {
    const [hoverTarget, setHoverTarget] = (0, react_1.useState)(null);
    const paragraphs = (0, react_1.useMemo)(() => {
        if (markdown && markdown.trim().length > 0)
            return fromMarkdown(markdown);
        if (markup && markup.trim().length > 0)
            return fromMarkup(markup);
        return [];
    }, [markdown, markup]);
    const hoverValues = (0, react_1.useMemo)(() => {
        if (!hoverTarget)
            return [];
        return cyphers.map((cypher, index) => ({
            cypher,
            value: calcForCypher(hoverTarget.text, cypher),
            accent: cypherAccent(cypher),
            key: cypher.id || cypher.name || `cypher-${index}`,
        }));
    }, [cyphers, hoverTarget]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `space-y-3 ${className}`, children: [paragraphs.map((paragraph, pIndex) => ((0, jsx_runtime_1.jsx)("p", { className: "whitespace-pre-wrap leading-7 text-gray-300", onMouseEnter: e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverTarget({
                        label: `Paragraph ${pIndex + 1}`,
                        text: stripInlineMarkdown(paragraph.text),
                        x: rect.right + 12,
                        y: rect.top + rect.height / 2,
                    });
                }, onMouseLeave: () => setHoverTarget(null), children: paragraph.sentences.map((sentence, sIndex) => ((0, jsx_runtime_1.jsx)("span", { className: "cursor-help rounded px-0.5 transition-colors hover:bg-[#10ff50]/10", onMouseEnter: e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoverTarget({
                            label: `Sentence ${pIndex + 1}.${sIndex + 1}`,
                            text: stripInlineMarkdown(sentence.trim()),
                            x: rect.right + 12,
                            y: rect.top + rect.height / 2,
                        });
                    }, children: renderInlineMarkdown(sentence, `p-${pIndex}-s-${sIndex}`) }, `p-${pIndex}-s-${sIndex}`))) }, `p-${pIndex}`))), hoverTarget && typeof document !== 'undefined' && (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsxs)("div", { className: "fixed z-[140] w-[280px] border border-[#10ff50]/35 bg-[#060b12] px-2.5 py-2", style: {
                    left: hoverTarget.x,
                    top: hoverTarget.y,
                    transform: 'translateY(-50%)',
                    boxShadow: '0 0 14px rgba(16,255,80,0.14)',
                }, children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-1 text-[10px] uppercase tracking-[0.14em] text-[#10ff50]", children: hoverTarget.label }), (0, jsx_runtime_1.jsx)("div", { className: "mb-2 space-y-1", children: splitIntoBalancedLines(hoverValues).map((line, lineIndex) => ((0, jsx_runtime_1.jsx)("div", { className: "grid gap-1", style: { gridTemplateColumns: `repeat(${Math.max(1, line.length)}, minmax(0, 1fr))` }, children: line.map(item => ((0, jsx_runtime_1.jsx)(Pill_1.Pill, { accent: item.accent, className: "w-full justify-center text-center text-[8px]", title: `${item.cypher.shortName || item.cypher.name}: ${item.value}`, children: item.value }, item.key))) }, `line-${lineIndex}`))) }), (0, jsx_runtime_1.jsx)("div", { className: "whitespace-pre-wrap text-[11px] text-gray-400", children: hoverTarget.text })] }), document.body)] }));
}
