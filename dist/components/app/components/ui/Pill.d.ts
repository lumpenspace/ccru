import React from 'react';
type PillProps = {
    children: React.ReactNode;
    accent?: string;
    onClose?: () => void;
    closeLabel?: string;
    className?: string;
    title?: string;
};
export declare function Pill({ children, accent, onClose, closeLabel, className, title, }: PillProps): import("react/jsx-runtime").JSX.Element;
export {};
