import React from 'react';
type Position = {
    x: number;
    y: number;
};
type CyberContainerProps = {
    title: string;
    children: React.ReactNode;
    draggable?: boolean;
    collapsible?: boolean;
    defaultOpen?: boolean;
    defaultPosition?: Position;
    width?: number;
    className?: string;
};
export declare function CyberContainer({ title, children, draggable, collapsible, defaultOpen, defaultPosition, width, className, }: CyberContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
