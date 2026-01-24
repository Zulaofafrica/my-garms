"use client";

import { useState } from "react";
import { GlowButton } from "@/components/ui/glow-button";
import { MapPin, Phone, User, Truck } from "lucide-react";
import { ordersApi } from "@/lib/api-client";

interface DeliveryDetailsFormProps {
    orderId: string;
    onSuccess: (details: any) => void;
}

export function DeliveryDetailsForm({ orderId, onSuccess }: DeliveryDetailsFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "Lagos", // Default or select
        landmark: "",
        instructions: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { order } = await ordersApi.submitDeliveryDetails(orderId, formData);
            onSuccess(order.deliveryDetails);
        } catch (error) {
            alert("Failed to save delivery details. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" /> Delivery Details
            </h2>
            <p className="text-slate-400 text-sm mb-6">
                Please provide your delivery information to proceed with payment.
                <br />
                <span className="text-xs text-yellow-500/80">Note: Delivery is currently only available within Nigeria.</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                            <input
                                required
                                type="text"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Receiver's Name"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                            <input
                                required
                                type="tel"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="080..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Delivery Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Street Address, Building, etc."
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">City</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. Ikeja"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">State</label>
                        <select
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                        >
                            <option value="Lagos">Lagos</option>
                            <option value="Abuja">Abuja</option>
                            <option value="Port Harcourt">Port Harcourt</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Country</label>
                        <input
                            type="text"
                            disabled
                            className="w-full bg-slate-800 border border-white/5 rounded-lg py-2.5 px-4 text-slate-400 cursor-not-allowed"
                            value="Nigeria"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Landmark (Optional)</label>
                    <input
                        type="text"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Nearest bus stop or recognizable building"
                        value={formData.landmark}
                        onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <GlowButton
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Delivery Details"}
                    </GlowButton>
                </div>
            </form>
        </div>
    );
}
