
import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success';
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
    const variants = {
        default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
        warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
        success: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
        outline: "text-foreground border-gray-200 dark:border-gray-800",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
};
