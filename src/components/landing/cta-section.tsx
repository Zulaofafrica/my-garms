"use client";

import { GlowButton } from "@/components/ui/glow-button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
    return (
        <section className="container py-24 px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center shadow-2xl sm:px-12 xl:py-32">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/30 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-purple-500/30 blur-[100px] rounded-full" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Ready to design your masterpiece?
                    </h2>
                    <p className="text-primary-foreground/80 md:text-xl">
                        Join thousands of creators who are defining their own style.
                        Start designing today for amazing offers!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/design">
                            <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                                Start Designing Now <ArrowRight className="h-4 w-4" />
                            </GlowButton>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
