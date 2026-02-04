
"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Palette, CheckCircle } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Define Your Vision",
            description: "Describe your dream outfit or pick a style from our curated collections.",
            icon: <Sparkles className="w-6 h-6 text-white" />,
        },
        {
            id: 2,
            title: "Get Matched",
            description: "Let our AI find your perfect designer, or browse experts and choose your own.",
            icon: <Users className="w-6 h-6 text-white" />,
        },
        {
            id: 3,
            title: "Collaborate & Create",
            description: "Chat directly with your designer as they bring your vision to life.",
            icon: <Palette className="w-6 h-6 text-white" />,
        },
        {
            id: 4,
            title: "Wear Your Story",
            description: "Receive your custom garment, crafted to perfection and ready to wear.",
            icon: <CheckCircle className="w-6 h-6 text-white" />,
        },
    ];

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-slate-400 text-lg">
                        From imagination to reality in four simple steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="relative flex flex-col items-center text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-6 relative z-10 group transition-all hover:border-indigo-500/50 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
                                <div className="absolute inset-0 rounded-full bg-indigo-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg">
                                    {step.icon}
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-400">
                                    {step.id}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
