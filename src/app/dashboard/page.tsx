"use client";

import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
    // Mock Data: In a real app, this would fetch from an API
    const mockRequests = [
        {
            id: "REQ-2026-001",
            title: "Custom Streetwear Hoodie",
            date: "Jan 10, 2026",
            status: "IN_REVIEW",
            thumb: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=200",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-heading text-white">My Requests</h1>
                    <Link
                        href="/design"
                        className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10"
                    >
                        + New Request
                    </Link>
                </div>

                <div className="grid gap-4">
                    {mockRequests.map((req) => (
                        <Link
                            key={req.id}
                            href={`/dashboard/${req.id}`}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                                    <img src={req.thumb} alt={req.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-white/50">{req.id}</span>
                                        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                            {req.status.replace("_", " ")}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-accent transition-colors">
                                        {req.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{req.date}</p>
                                </div>
                                <div className="pr-4">
                                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {mockRequests.length === 0 && (
                        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                            <p className="text-muted-foreground">No active requests found.</p>
                            <Link href="/design" className="text-accent hover:underline mt-2 inline-block">Start your first design</Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
