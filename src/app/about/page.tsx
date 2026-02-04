
"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Leaf, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative py-24 px-4 md:px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-background z-0" />
                <div className="container mx-auto relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Crafting Your Perfect Fit
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            MyGarms isn't just a platform; it's a movement to democratize bespoke fashion.
                            We connect visionaries with master craftsmen to create garments that tell a story—your story.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-16 px-4 md:px-6 bg-muted/30">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            icon={<Sparkles className="w-6 h-6 text-primary" />}
                            title="Uniqueness"
                            description="No two people are alike. Why should their clothes be? We celebrate individuality in every stitch."
                        />
                        <ValueCard
                            icon={<Users className="w-6 h-6 text-primary" />}
                            title="Community"
                            description="We empower independent designers and tailors, giving them a global stage to showcase their art."
                        />
                        <ValueCard
                            icon={<Leaf className="w-6 h-6 text-primary" />}
                            title="Sustainability"
                            description="Made-to-order means zero waste. We believe in slow fashion that lasts a lifetime."
                        />
                        <ValueCard
                            icon={<Heart className="w-6 h-6 text-primary" />}
                            title="Quality"
                            description="We don't cut corners. From fabric selection to the final fitting, excellence is our standard."
                        />
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-24 px-4 md:px-6">
                <div className="container mx-auto max-w-4xl">
                    <div className="prose prose-lg mx-auto dark:prose-invert">
                        <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
                        <p>
                            In a world of fast fashion and disposable trends, MyGarms was born from a desire for something more meaningful.
                            We wanted to bring back the personal connection between the wearer and the maker.
                        </p>
                        <p>
                            What started as a simple idea—to make custom tailoring accessible to everyone—has grown into a vibrant ecosystem
                            of designers, tailors, and style enthusiasts. We are building the future of fashion, one custom garment at a time.
                        </p>
                        <p>
                            Whether you're looking for a sharp business suit, a wedding dress that defies tradition, or everyday wear
                            that fits like a glove, MyGarms is where your vision becomes reality.
                        </p>
                    </div>
                </div>
            </section>
            {/* Team Section */}
            <section className="py-24 px-4 md:px-6 bg-muted/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold font-heading mb-4">Our Team</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            The visionaries and creators driving the future of custom fashion.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TeamMember name="Kayode Onanuga" role="Founder, CEO" color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                        <TeamMember name="Adebayo Adebanjo" role="CFO" color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" />
                        <TeamMember name="Adebayo Adams" role="CTO" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" />
                        <TeamMember name="Erica Mugege" role="Creative Director" color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
                        <TeamMember name="Michael Onyekuru" role="Chief Procurement Office" color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
                        <TeamMember name="Feyisayo Onanuga" role="Chief Stylist" color="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" />
                        <TeamMember name="Eniola Doko" role="Product Manager" color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" />
                        <TeamMember name="Oreoluwa Amoo" role="Lead Strategist/Analyst" color="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" />
                    </div>
                </div>
            </section>
        </main>
    );
}

function TeamMember({ name, role, color }: { name: string, role: string, color?: string }) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors group">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 font-bold text-2xl transition-transform group-hover:scale-110 ${color || 'bg-primary/10 text-primary'}`}>
                {name.charAt(0)}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{role}</p>
        </div>
    );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 text-primary">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}
