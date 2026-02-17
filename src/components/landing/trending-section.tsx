
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// This is a Server Component
export async function TrendingSection() {
    return (
        <section className="py-16 bg-background">
            <div className="container px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading">
                                Trending Styles
                            </h2>
                            <p className="text-muted-foreground md:text-lg max-w-2xl">
                                Explore our most popular curated designs. Ready to customize and order.
                            </p>
                        </div>
                        <Link
                            href="/gallery"
                            className="group inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                        >
                            View All Collections
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <TrendingGrid />
                </div>
            </div>
        </section>
    );
}

// Separate component to handle the fetch logic cleanly
async function TrendingGrid() {
    // Determine API URL (absolute for server-side fetch)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    let designs = [];

    try {
        // Fetch public curated designs
        const res = await fetch(`${baseUrl}/api/curated-designs`, { next: { revalidate: 60 } });
        if (res.ok) {
            const data = await res.json();
            // Take top 3
            designs = data.designs.slice(0, 3);
        }
    } catch (e) {
        console.error("Failed to fetch trending designs", e);
    }

    if (designs.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">More designs coming soon.</p>
            </div>
        );
    }

    return (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-3 md:pb-0 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {designs.map((design: any) => (
                <Link key={design.id} href={`/gallery/${design.id}`} className="group block w-[85vw] shrink-0 md:w-auto snap-center">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                        {design.images && design.images[0] ? (
                            <img
                                src={design.images[0]}
                                alt={design.title}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                                <span className="text-muted-foreground">No Image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                        <div className="absolute bottom-0 left-0 p-4 text-white">
                            <h3 className="text-lg font-bold mb-0.5">{design.title}</h3>
                            <p className="text-white/80 text-xs line-clamp-1">{design.base_price_range}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
