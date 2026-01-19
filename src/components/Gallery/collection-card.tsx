"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CollectionItem {
    id: string;
    title: string;
    category: string;
    image: string;
    price: string;
}

interface CollectionCardProps {
    item: CollectionItem;
    index: number;
}

export function CollectionCard({ item, index }: CollectionCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/5 aspect-[3/4]"
        >
            <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2 block">
                            {item.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-white/70">{item.price}</p>
                    </div>
                    <Link
                        href="/design"
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
