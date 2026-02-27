import React from 'react';
type CyberPanelHeaderProps = {
    title: React.ReactNode;
    leftSlot?: React.ReactNode;
    rightSlot?: React.ReactNode;
    className?: string;
    titleClassName?: string;
    onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    role?: React.AriaRole;
    tabIndex?: number;
    ariaExpanded?: boolean;
    style?: React.CSSProperties;
};
export declare function CyberPanelHeader({ title, leftSlot, rightSlot, className, titleClassName, onMouseDown, onClick, onKeyDown, role, tabIndex, ariaExpanded, style, }: CyberPanelHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
