"use client";

import { Gender } from "@/lib/types";
import { motion } from "framer-motion";

interface GenderSelectorProps {
    value: Gender;
    onChange: (gender: Gender) => void;
    disabled?: boolean;
}

export function GenderSelector({ value, onChange, disabled = false }: GenderSelectorProps) {
    return (
        <div className="mb-8">
            <label className="block text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">
                Select Gender
            </label>
            <div className="flex gap-4">
                <motion.button
                    type="button"
                    onClick={() => onChange('male')}
                    disabled={disabled}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border transition-all duration-300 ${
                        value === 'male'
                            ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/5"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={value === 'male' ? "text-indigo-400" : "text-slate-500"}
                    >
                        <circle cx="10" cy="14" r="5" />
                        <path d="M19 5l-5.4 5.4" />
                        <path d="M15 5h4v4" />
                    </svg>
                    <span className="font-medium">Male</span>
                </motion.button>

                <motion.button
                    type="button"
                    onClick={() => onChange('female')}
                    disabled={disabled}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border transition-all duration-300 ${
                        value === 'female'
                            ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                            : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/5"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={value === 'female' ? "text-indigo-400" : "text-slate-500"}
                    >
                        <circle cx="12" cy="8" r="5" />
                        <path d="M12 13v8" />
                        <path d="M9 18h6" />
                    </svg>
                    <span className="font-medium">Female</span>
                </motion.button>
            </div>
        </div>
    );
}
