"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlowButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
}

export function GlowButton({
    children,
    className,
    variant = "primary",
    size = "default",
    isLoading,
    ...props
}: GlowButtonProps & { isLoading?: boolean }) {
    const sizeClasses = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative group isolate rounded-full text-base font-medium transition-all duration-300 flex items-center justify-center",
                sizeClasses[size],
                variant === "primary" ? [
                    "bg-primary text-primary-foreground",
                    "shadow-[0_0_25px_-5px_var(--primary)]",
                    "hover:shadow-[0_0_40px_-10px_var(--primary)]",
                    "border border-white/10"
                ] : [
                    "bg-secondary/80 backdrop-blur-sm text-secondary-foreground",
                    "hover:bg-secondary",
                    "border border-border"
                ],
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
            {variant === "primary" && (
                <div className="absolute inset-0 -z-10 overflow-hidden rounded-full">
                    <div className="absolute left-[50%] top-[50%] aspect-square w-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
            )}
        </motion.button>
    );
}
