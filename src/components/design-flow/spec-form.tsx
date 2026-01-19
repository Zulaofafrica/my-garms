"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

const FABRICS = [
    { id: "cotton", name: "Premium Cotton", desc: "Soft, breathable, durable (180gsm)" },
    { id: "silk", name: "Organic Silk", desc: "Luxurious sheen, lightweight" },
    { id: "linen", name: "French Linen", desc: "Textured, airy, summer essential" },
    { id: "denim", name: "Japanese Denim", desc: "Heavyweight, structured (14oz)" },
];

const COLORS = [
    { id: "midnight", name: "Midnight Black", hex: "#000000" },
    { id: "cloud", name: "Cloud White", hex: "#ffffff" },
    { id: "navy", name: "Deep Navy", hex: "#1a237e" },
    { id: "olive", name: "Olive Green", hex: "#33691e" },
    { id: "burgundy", name: "Burgundy", hex: "#880e4f" },
];

export function SpecForm() {
    const { register, watch, setValue } = useFormContext();
    const selectedFabric = watch("fabric");
    const selectedColor = watch("color");

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold font-heading">Specifications</h2>
                <p className="text-muted-foreground">Select your premium materials.</p>
            </div>

            {/* Fabric Selection */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Fabric Type</label>
                <div className="grid sm:grid-cols-2 gap-4">
                    {FABRICS.map((fabric) => (
                        <div
                            key={fabric.id}
                            onClick={() => setValue("fabric", fabric.id)}
                            className={cn(
                                "cursor-pointer rounded-xl p-4 border transition-all duration-200 flex items-start justify-between",
                                selectedFabric === fabric.id
                                    ? "border-accent bg-accent/10 shadow-[0_0_15px_-5px_var(--accent)]"
                                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            )}
                        >
                            <div>
                                <div className="font-semibold text-white">{fabric.name}</div>
                                <div className="text-sm text-muted-foreground">{fabric.desc}</div>
                            </div>
                            <input
                                type="radio"
                                value={fabric.id}
                                className="hidden"
                                {...register("fabric")}
                            />
                            {selectedFabric === fabric.id && (
                                <div className="w-4 h-4 rounded-full bg-accent mt-1" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-4">
                <label className="text-sm font-medium text-white/70 uppercase tracking-wider">Color Palette</label>
                <div className="flex flex-wrap gap-3">
                    {COLORS.map((color) => (
                        <div
                            key={color.id}
                            onClick={() => setValue("color", color.id)}
                            className="group cursor-pointer relative"
                        >
                            <input
                                type="radio"
                                value={color.id}
                                className="hidden"
                                {...register("color")}
                            />
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full border-2 transition-all duration-200",
                                    selectedColor === color.id
                                        ? "border-white scale-110 shadow-lg"
                                        : "border-transparent group-hover:scale-105"
                                )}
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                                {color.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
