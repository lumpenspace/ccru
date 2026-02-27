import React from 'react';
type CyberButtonProps = {
    onClick?: () => void;
    active?: boolean;
    indicator?: boolean;
    disabled?: boolean;
    shortcut?: string;
    size?: 'md' | 'sm';
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    className?: string;
    children: React.ReactNode;
};
export declare function CyberButton({ onClick, active, indicator, disabled, shortcut, size, onMouseEnter, onMouseLeave, className, children, }: CyberButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
