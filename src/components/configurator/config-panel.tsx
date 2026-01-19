"use client";

import { useConfigurator } from "@/hooks/use-configurator";
import { cn } from "@/lib/utils";
import { GlowButton } from "../ui/glow-button";

const colors = [
    { name: "Midnight", value: "#1a1f2c" },
    { name: "Indigo", value: "#4338ca" },
    { name: "Forest", value: "#166534" },
    { name: "Crimson", value: "#991b1b" },
    { name: "Slate", value: "#64748b" },
];

const materials = [
    { id: "cotton", label: "Premium Cotton" },
    { id: "silk", label: "Organic Silk" },
    { id: "denim", label: "Raw Denim" },
];

export function ConfigPanel() {
    const { color, setColor, material, setMaterial } = useConfigurator();

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl z-10 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="grid gap-8 md:grid-cols-2">
                {/* Colors */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/50 uppercase tracking-wider">
                        Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {colors.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setColor(c.value)}
                                className={cn(
                                    "w-10 h-10 rounded-full border-2 transition-all duration-200",
                                    color === c.value
                                        ? "border-white scale-110 shadow-[0_0_15px_-3px_rgba(255,255,255,0.5)]"
                                        : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: c.value }}
                                aria-label={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Materials */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-white/50 uppercase tracking-wider">
                        Material
                    </label>
                    <div className="flex flex-col gap-2">
                        {materials.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMaterial(m.id as any)}
                                className={cn(
                                    "px-4 py-3 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between",
                                    material === m.id
                                        ? "bg-white text-black shadow-lg"
                                        : "bg-white/5 text-white hover:bg-white/10"
                                )}
                            >
                                <span>{m.label}</span>
                                {material === m.id && (
                                    <div className="w-2 h-2 rounded-full bg-accent" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-white">
                    <div className="text-xs opacity-50">Total Estimation</div>
                    <div className="text-xl font-bold">$129.00</div>
                </div>
                <GlowButton size="sm">Add to Cart</GlowButton>
            </div>
        </div>
    );
}
