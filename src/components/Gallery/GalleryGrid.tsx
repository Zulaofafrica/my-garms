"use client";

import { useState } from "react";
import { FilterBar } from "./filter-bar";
import { CollectionCard } from "./collection-card";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const ALL_ITEMS = [
    {
        id: "1",
        title: "Neo-Tokyo Bomber",
        category: "Streetwear",
        price: "₦240,000",
        image: "https://images.unsplash.com/photo-1551488852-080175b9514e?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: "2",
        title: "Midnight Silk Suit",
        category: "Formal",
        price: "₦850,000",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: "3",
        title: "Oversized Denim",
        category: "Streetwear",
        price: "₦180,000",
        image: "https://images.unsplash.com/photo-1576995853123-5a297da40307?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: "4",
        title: "Abstract Trench",
        category: "Avant-Garde",
        price: "₦600,000",
        image: "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: "5",
        title: "Tech-Fleece Jogger",
        category: "Streetwear",
        price: "₦120,000",
        image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: "6",
        title: "Velvet Dinner Jacket",
        category: "Formal",
        price: "₦450,000",
        image: "https://images.unsplash.com/photo-1593030761757-71bd90dbe3e4?auto=format&fit=crop&q=80&w=400",
    },
];

const CATEGORIES = ["All", "Streetwear", "Formal", "Avant-Garde"];

export function GalleryGrid() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredItems = activeCategory === "All"
        ? ALL_ITEMS
        : ALL_ITEMS.filter(item => item.category === activeCategory);

    return (
        <div>
            <FilterBar
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
            />

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
        </div>
    );
}
