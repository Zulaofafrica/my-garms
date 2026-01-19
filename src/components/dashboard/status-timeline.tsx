"use client";

import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: "SUBMITTED", label: "Request Submitted" },
    { id: "IN_REVIEW", label: "Designer Review" },
    { id: "ACTION_REQUIRED", label: "Final Approval" },
    { id: "PAYMENT", label: "Production & Payment" },
];

interface StatusTimelineProps {
    status: string;
}

export function StatusTimeline({ status }: StatusTimelineProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === status);

    return (
        <div className="w-full py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative gap-8 md:gap-0">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-[15px] left-0 w-full h-[2px] bg-white/10 -z-10" />

                {STEPS.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-auto">
                            {/* Icon Circle */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                                    isCompleted || isCurrent
                                        ? "bg-accent border-accent text-white shadow-[0_0_15px_-3px_var(--accent)]"
                                        : "bg-slate-900 border-white/10 text-white/30"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : isCurrent ? (
                                    <Clock className="w-4 h-4 animate-pulse" />
                                ) : (
                                    <Circle className="w-3 h-3" />
                                )}
                            </div>

                            {/* Text */}
                            <div className={cn(
                                "text-sm font-medium transition-colors duration-300",
                                isCurrent ? "text-white scale-105" : isCompleted ? "text-white/70" : "text-white/30"
                            )}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
