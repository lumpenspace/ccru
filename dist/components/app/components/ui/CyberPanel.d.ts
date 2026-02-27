import React from 'react';
type PositionMode = 'fixed' | 'absolute' | 'relative';
type CollapseDirection = 'none' | 'vertical' | 'side';
export interface CyberPanelProps {
    id: string;
    title: string;
    position: {
        x: number;
        y: number;
    };
    width?: number | string;
    open?: boolean;
    onToggle?: () => void;
    defaultOpen?: boolean;
    onActivate?: (panelId: string) => void;
    onHeightChange?: (panelId: string, height: number) => void;
    draggable?: boolean;
    onDragStart: (panelId: string, e: React.MouseEvent) => void;
    zIndex?: number;
    maxBodyHeight?: number;
    scrollable?: boolean;
    showToggle?: boolean;
    collapseDirection?: CollapseDirection;
    headerRight?: React.ReactNode;
    positionMode?: PositionMode;
    children: React.ReactNode;
}
export declare function CyberPanel({ id, title, position, width, open, onToggle, defaultOpen, onActivate, onHeightChange, draggable, onDragStart, zIndex, maxBodyHeight, scrollable, showToggle, collapseDirection, headerRight, positionMode, children, }: CyberPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
