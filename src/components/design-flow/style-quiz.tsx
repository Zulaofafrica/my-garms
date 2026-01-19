"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Sparkles, Briefcase, Zap, Heart } from "lucide-react";

const STYLES = [
    { id: "streetwear", name: "Streetwear", icon: Zap, desc: "Bold, oversized, trendy" },
    { id: "formal", name: "Formal / Business", icon: Briefcase, desc: "Sharp, tailored, classic" },
    { id: "casual", name: "Smart Casual", icon: Heart, desc: "Comfortable, relaxed, versatile" },
    { id: "experimental", name: "Avant-Garde", icon: Sparkles, desc: "Unique, artistic, bold" },
];

export function StyleQuiz() {
    const { register, watch, setValue } = useFormContext();
    const selectedStyle = watch("style");

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold font-heading">Style Profile</h2>
                <p className="text-muted-foreground">What's the vibe you're going for?</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {STYLES.map((style) => {
                    const Icon = style.icon;
                    return (
                        <div
                            key={style.id}
                            onClick={() => setValue("style", style.id)}
                            className={cn(
                                "cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 flex flex-col items-center text-center gap-4",
                                selectedStyle === style.id
                                    ? "border-accent bg-accent/5"
                                    : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                            )}
                        >
                            <input
                                type="radio"
                                value={style.id}
                                className="hidden"
                                {...register("style")}
                            />
                            <div className={cn(
                                "p-3 rounded-full",
                                selectedStyle === style.id ? "bg-accent text-white" : "bg-white/10 text-white/70"
                            )}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-white">{style.name}</div>
                                <div className="text-sm text-muted-foreground">{style.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
