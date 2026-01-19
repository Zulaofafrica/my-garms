"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Calendar, AlertCircle } from "lucide-react";

export function SpecForm() {
    const { register, watch, setValue, formState: { errors } } = useFormContext();
    const urgency = watch("urgency");
    const fabricSource = watch("fabricSource");
    const budgetRange = watch("budgetRange");

    return (
        <div className="space-y-10 animate-in slide-in-from-right-8 fade-in duration-500 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading text-white">Logistics</h2>
                <p className="text-slate-400">Timeline and budget help us find the right match.</p>
            </div>

            {/* Timeline / Urgency */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    When do you need it? <span className="text-red-400">*</span>
                </label>
                <div className="grid gap-3">
                    {[
                        { id: 'flexible', label: 'Flexible', desc: 'No rush (Best Price)', icon: '📅' },
                        { id: 'standard', label: 'Standard', desc: '2-3 Weeks', icon: '🗓️' },
                        { id: 'urgent', label: 'Urgent', desc: '< 1 Week (Express Fee)', icon: '⚡' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setValue("urgency", opt.id, { shouldValidate: true })}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                                urgency === opt.id
                                    ? "bg-indigo-500/20 border-indigo-500"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                        >
                            <span className="text-xl">{opt.icon}</span>
                            <div>
                                <div className="font-bold text-white">{opt.label}</div>
                                <div className="text-xs text-slate-400">{opt.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("urgency", { required: "Please select a timeline" })} />
                {errors.urgency && <p className="text-red-400 text-sm">Required</p>}
            </div>

            {/* Fabric Source */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Fabric Preference
                </label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'platform', label: 'Use MyGarms Fabric' },
                        { id: 'own', label: 'I Have My Own Fabric' },
                        { id: 'unsure', label: 'Not Sure Yet' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setValue("fabricSource", opt.id)}
                            className={cn(
                                "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                                fabricSource === opt.id
                                    ? "bg-white text-black border-white"
                                    : "bg-transparent text-slate-400 border-white/20 hover:border-white/50"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("fabricSource")} />
            </div>

            {/* Budget Range (Optional) */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Budget Range (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'budget', label: 'Economy', desc: '₦' },
                        { id: 'standard', label: 'Standard', desc: '₦₦' },
                        { id: 'premium', label: 'Premium', desc: '₦₦₦' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setValue("budgetRange", opt.id)}
                            className={cn(
                                "p-3 rounded-lg border text-center transition-all",
                                budgetRange === opt.id
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            )}
                        >
                            <div className="text-lg font-bold mb-1">{opt.desc}</div>
                            <div className="text-xs">{opt.label}</div>
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register("budgetRange")} />
            </div>

        </div>
    );
}
