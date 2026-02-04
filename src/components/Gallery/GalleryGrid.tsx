"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "./filter-bar";
import { CollectionCard } from "./collection-card";
import { motion, AnimatePresence } from "framer-motion";
import { CuratedDesign } from "@/lib/api-client";

const CATEGORIES = ["All", "Dress", "Suit", "Shirt / Top", "Native Wear", "Two-Piece Set", "Pants / Jackets"];

export function GalleryGrid() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [designs, setDesigns] = useState<CuratedDesign[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                const res = await fetch('/api/curated-designs');
                const data = await res.json();
                setDesigns(data.designs || []);
            } catch (error) {
                console.error("Failed to fetch designs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDesigns();
    }, []);

    const filteredItems = activeCategory === "All"
        ? designs
        : designs.filter(item => item.category === activeCategory);

    return (
        <div className="min-h-[400px]">
            <FilterBar
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
            />

            {isLoading ? (
                <div className="text-center py-20 text-white/40">Loading curated designs...</div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, index) => (
                            <CollectionCard key={item.id} item={item} index={index} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!isLoading && filteredItems.length === 0 && (
                <div className="text-center py-20 text-white/40">
                    No designs found for {activeCategory}.
                </div>
            )}
        </div>
    );
}
