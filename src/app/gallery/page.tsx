"use client";

import { GalleryGrid } from "@/components/Gallery/GalleryGrid";

export default function GalleryPage() {
    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-6">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="container max-w-7xl mx-auto space-y-12">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold font-heading text-white sm:text-5xl">
                        Curated Collections
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Explore the latest community designs and detailed craftsmanship.
                        Click any item to use it as a base for your own design.
                    </p>
                </div>

                <GalleryGrid />
            </div>
        </main>
    );
}
