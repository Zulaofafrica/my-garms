
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles } from "lucide-react";

const faqs = [
    {
        question: "How does the custom design process work?",
        answer: "It's simple! You can either choose a trending style from our collection or describe your dream outfit in our Design Wizard. Our AI then matches you with specialized designers who can bring your vision to life. You collaborate directly with them, approve the design, and we handle the rest."
    },
    {
        question: "Can I provide my own fabric?",
        answer: "Absolutely. We believe in total creative freedom. During the design process, you can choose to source your own fabric. We'll provide you with a shipping label to send it directly to your designer or our production hub. Alternatively, you can choose from our curated selection of premium materials."
    },
    {
        question: "How do I know my measurements will be correct?",
        answer: "We use a smart measurement profile system. You can save your measurements once and use them for all future orders. We also provide a detailed guide on how to measure yourself accurately. For complex pieces, your designer will review your measurements to ensure the perfect fit."
    },
    {
        question: "How long does production take?",
        answer: "Production times vary depending on the complexity of the design and the designer's schedule. Typically, custom garments take between 2-4 weeks. You'll receive a more accurate timeline once your order is confirmed, and you can track every step of the process in your dashboard."
    },
    {
        question: "What if I'm not happy with the result?",
        answer: "Your satisfaction is our priority. We offer a satisfaction guarantee on all orders. If the garment doesn't match the agreed-upon design or has quality issues, we will work with you and the designer to make it right, whether that means alterations or a remake."
    }
];

export function FAQSection() {
    return (
        <section className="container py-24 px-4 md:px-6">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
                    <Sparkles className="mr-2 h-4 w-4" />
                    <span>Got Questions?</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading">
                    Frequently Asked Questions
                </h2>
                <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                    Everything you need to know about creating your custom look with MyGarms.
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                ))}
            </div>
        </section>
    );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`rounded-2xl border transition-all duration-200 ${isOpen ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]" : "border-border bg-card hover:border-indigo-500/30"
                }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? "text-indigo-400" : "text-foreground"}`}>
                    {question}
                </span>
                <span className={`ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${isOpen ? "border-indigo-500 bg-indigo-500 text-white" : "border-border text-muted-foreground"}`} >
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
