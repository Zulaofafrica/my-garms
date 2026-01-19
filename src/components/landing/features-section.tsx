"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Shirt,
    Palette,
    Truck,
    Users
} from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
    return (
        <section className="container py-20 px-4 md:px-6">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-heading">
                    Why Choose MyGarms?
                </h2>
                <p className="mt-4 text-muted-foreground md:text-xl">
                    Everything you need to create your perfect fit.
                </p>
            </div>

            <BentoGrid className="max-w-4xl mx-auto">
                {items.map((item, i) => (
                    <BentoGridItem
                        key={i}
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        icon={item.icon}
                        className={i === 1 || i === 2 ? "md:col-span-1" : "md:col-span-2"}
                    />
                ))}
            </BentoGrid>
        </section>
    );
}

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 ${className}`} />
);

const items = [
    {
        title: "Custom 3D Canvas",
        description: "Design every inch of your garment in our real-time 3D studio.",
        header: <Skeleton className="bg-gradient-to-br from-violet-500/20 to-purple-500/20" />,
        icon: <Shirt className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Premium Materials",
        description: "Sourced from the finest mills worldwide.",
        header: <Skeleton className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />,
        icon: <Palette className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Fast Delivery",
        description: "From our studio to your door in days.",
        header: <Skeleton className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20" />,
        icon: <Truck className="h-4 w-4 text-neutral-500" />,
    },
    {
        title: "Community Styles",
        description: "Get inspired by trending designs from our community.",
        header: <Skeleton className="bg-gradient-to-br from-pink-500/20 to-rose-500/20" />,
        icon: <Users className="h-4 w-4 text-neutral-500" />,
    },
];
