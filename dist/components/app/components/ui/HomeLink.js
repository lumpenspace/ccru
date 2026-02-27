"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeLink = HomeLink;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
function HomeLink({ href = '/', label = 'Home', className = '', boxed = true, }) {
    const chromeStyle = boxed
        ? {
            border: '1px solid rgba(107,114,128,0.35)',
            background: 'rgba(107,114,128,0.06)',
        }
        : undefined;
    return ((0, jsx_runtime_1.jsx)(link_1.default, { href: href, className: `px-1.5 py-1 text-[9px] tracking-[0.12em] uppercase text-gray-500 hover:text-gray-200 transition-colors ${className}`, style: chromeStyle, children: label }));
}
