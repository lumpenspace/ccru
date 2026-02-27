import React, { type ReactNode } from 'react';
type CyberCardContainerProps = {
    title: ReactNode;
    children: React.ReactNode;
    className?: string;
    collapsible?: boolean;
    defaultOpen?: boolean;
};
export declare function CyberCardContainer({ title, children, className, collapsible, defaultOpen, }: CyberCardContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
