"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-10 md:py-20 lg:py-32">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-30" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/20 blur-[100px] rounded-full opacity-20" />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center"
                    >
                        <div className="inline-flex items-center rounded-full border bg-background/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-sm">
                            <Sparkles className="mr-2 h-4 w-4 text-accent" />
                            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                The Future of Custom Fashion
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-heading text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
                    >
                        Your Style. Your Way. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Expertly Crafted.</span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
                    >
                        Choose from our curated collections or bring your own unique vision.
                        We match you with top designers to bring your perfect outfit to life.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/gallery">
                            <GlowButton size="lg" className="w-full sm:w-auto gap-2">
                                Browse Collections <ArrowRight className="h-4 w-4" />
                            </GlowButton>
                        </Link>
                        <Link href="/design">
                            <GlowButton variant="secondary" size="lg" className="w-full sm:w-auto">
                                Create Custom Request
                            </GlowButton>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
