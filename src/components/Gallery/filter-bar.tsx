"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterBarProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

export function FilterBar({ categories, activeCategory, onSelect }: FilterBarProps) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                    <button
                        key={category}
                        onClick={() => onSelect(category)}
                        className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-white rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className={cn("relative z-10", isActive ? "text-black" : "text-white hover:text-white/80")}>
                            {category}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
