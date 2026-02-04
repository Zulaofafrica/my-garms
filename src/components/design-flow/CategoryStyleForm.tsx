
"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Check, User, Briefcase, Shirt, Gem } from "lucide-react";

export const CATEGORIES = [
    { id: 'dress', label: 'Dress', icon: '👗' },
    { id: 'suit', label: 'Suit', icon: '👔' },
    { id: 'shirt', label: 'Shirt / Top', icon: '👕' },
    { id: 'native', label: 'Native Wear', icon: '👘' },
    { id: 'two-piece', label: 'Two-Piece Set', icon: '👚' },
    { id: 'jacket', label: 'Pants / Jackets', icon: '🧥' },
];

export const STYLES = [
    { id: 'casual', label: 'Casual', desc: 'Relaxed & Comfortable' },
    { id: 'formal', label: 'Formal / Business', desc: 'Sharp & Structured' },
    { id: 'traditional', label: 'Traditional', desc: 'Cultural & Heritage' },
    { id: 'streetwear', label: 'Streetwear', desc: 'Bold & Trendy' },
    { id: 'bridal', label: 'Bridal / Wedding', desc: 'Elegant & Intricate' },
    { id: 'evening', label: 'Evening Wear', desc: 'Glamorous & Chic' },
];

export function CategoryStyleForm() {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const selectedCategory = watch("category");
    const selectedStyle = watch("style");

    return (
        <div className="space-y-10 animate-in slide-in-from-right-8 fade-in duration-500 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading text-white">Start Your Vision</h2>
                <p className="text-slate-400">What kind of outfit are you looking to create?</p>
            </div>

            {/* Category Grid */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    Outfit Category <span className="text-red-400">*</span>
                    {errors.category && <span className="text-red-400 normal-case">{errors.category.message as string}</span>}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setValue("category", cat.id, { shouldValidate: true })}
                            className={cn(
                                "relative p-4 rounded-xl border-2 text-left transition-all hover:bg-white/5",
                                selectedCategory === cat.id
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-white/10 text-slate-400"
                            )}
                        >
                            <span className="text-2xl block mb-2">{cat.icon}</span>
                            <span className={cn("font-semibold block", selectedCategory === cat.id ? "text-white" : "text-white")}>
                                {cat.label}
                            </span>
                            {selectedCategory === cat.id && (
                                <div className="absolute top-3 right-3 text-indigo-400"><Check size={16} /></div>
                            )}
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("category", { required: "Please select a category" })} />
            </div>

            {/* Style Grid */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    Style Aesthetic <span className="text-red-400">*</span>
                    {errors.style && <span className="text-red-400 normal-case">{errors.style.message as string}</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STYLES.map((style) => (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => setValue("style", style.id, { shouldValidate: true })}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:bg-white/5",
                                selectedStyle === style.id
                                    ? "border-purple-500 bg-purple-500/10"
                                    : "border-white/10"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                                selectedStyle === style.id ? "bg-purple-500 text-white" : "bg-white/10 text-slate-500"
                            )}>
                                {style.id === 'casual' && <User size={18} />}
                                {style.id === 'formal' && <Briefcase size={18} />}
                                {style.id === 'traditional' && <Gem size={18} />}
                                {style.id === 'streetwear' && <Shirt size={18} />}
                                {style.id === 'bridal' && <Gem size={18} />}
                                {style.id === 'evening' && <Gem size={18} />}
                            </div>
                            <div className="text-left">
                                <div className={cn("font-bold", selectedStyle === style.id ? "text-white" : "text-white")}>
                                    {style.label}
                                </div>
                                <div className="text-xs text-slate-400">{style.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("style", { required: "Please select a style" })} />
            </div>
        </div>
    );
}
