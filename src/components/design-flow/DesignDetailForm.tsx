
"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ImageUpload } from "./image-upload";
import { Info } from "lucide-react";

const COMPLEXITY_LEVELS = [
    {
        id: 'simple',
        label: 'Simple',
        desc: 'Minimal details. Basic cuts. No embroidery/beading.',
        color: 'bg-green-500'
    },
    {
        id: 'moderate',
        label: 'Moderate',
        desc: 'Some unique design elements, linings, or mix of fabrics.',
        color: 'bg-yellow-500'
    },
    {
        id: 'detailed',
        label: 'Detailed',
        desc: 'Complex structure, heavy embroidery, lace appliques, orcorsetry.',
        color: 'bg-red-500'
    },
];

export function DesignDetailForm() {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const selectedComplexity = watch("complexity");

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-500 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading text-white">Design Details</h2>
                <p className="text-slate-400">Help designers understand the work required.</p>
            </div>

            {/* Inspiration Images */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Inspiration Images <span className="text-red-400">*</span>
                </label>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <ImageUpload name="images" />
                    {errors.images && <p className="text-red-400 text-sm mt-2">Please upload at least one image.</p>}
                </div>
            </div>

            {/* Complexity Level */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Complexity Level <span className="text-red-400">*</span>
                    </label>
                    <div className="group relative">
                        <Info size={14} className="text-slate-500 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 p-3 rounded-lg text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                            Higher complexity requires more skilled designers and time.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COMPLEXITY_LEVELS.map((level) => (
                        <button
                            key={level.id}
                            type="button"
                            onClick={() => setValue("complexity", level.id, { shouldValidate: true })}
                            className={cn(
                                "flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all hover:bg-white/5",
                                selectedComplexity === level.id
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-white/10"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full mb-3", level.color)} />
                            <span className="font-bold text-white mb-1">{level.label}</span>
                            <span className="text-xs text-slate-400 leading-tight">{level.desc}</span>
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("complexity", { required: "Please select complexity" })} />
                {errors.complexity && <p className="text-red-400 text-sm">{errors.complexity.message as string}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Design Notes
                </label>
                <textarea
                    {...register("notes")}
                    placeholder="Tell us about the fit, specific details you like (e.g. puffy sleeves), or anything else..."
                    className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none transition-all"
                />
            </div>
        </div>
    );
}
