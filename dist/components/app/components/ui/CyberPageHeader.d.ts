import type { ReactNode } from 'react';
type CyberPageHeaderProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: string;
    className?: string;
    homeHref?: string;
    homeLabel?: string;
    showHomeLink?: boolean;
    actions?: ReactNode;
};
export declare function CyberPageHeader({ title, description, icon, className, homeHref, homeLabel, showHomeLink, actions, }: CyberPageHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
