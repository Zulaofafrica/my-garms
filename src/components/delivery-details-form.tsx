"use client";

import { useEffect, useState } from "react";
import { GlowButton } from "@/components/ui/glow-button";
import { Package, Truck, MapPin, Phone, User, Home, Briefcase } from "lucide-react";
import { ordersApi, addressesApi } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define the schema for delivery details
const deliverySchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().optional(), // Added based on defaultValues
    instructions: z.string().optional(),
});

type DeliveryDetailsFormData = z.infer<typeof deliverySchema>;

interface DeliveryDetailsFormProps {
    orderId: string;
    onSuccess: (details: any) => void;
}

export function DeliveryDetailsForm({ orderId, onSuccess }: DeliveryDetailsFormProps) {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        loadSavedAddresses();
    }, []);

    const loadSavedAddresses = async () => {
        try {
            const data = await addressesApi.list();
            setSavedAddresses(data.addresses);
            if (data.addresses.length > 0) setShowSaved(true);
        } catch (error) {
            console.error("Failed to load addresses");
        }
    };

    // Replaced formData useState with useForm
    const form = useForm<DeliveryDetailsFormData>({
        resolver: zodResolver(deliverySchema),
        defaultValues: {
            fullName: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            postalCode: "",
            instructions: ""
        }
    });

    const handleSelectAddress = (addr: any) => {
        form.setValue("fullName", addr.fullName);
        form.setValue("phone", addr.phone);
        form.setValue("address", addr.address);
        form.setValue("city", addr.city);
        form.setValue("state", addr.state);
        // addresses might not have postal code, leave as is or clear
        // If addr has postalCode, you might want to set it: form.setValue("postalCode", addr.postalCode || "");
        // If addr has instructions, you might want to set it: form.setValue("instructions", addr.instructions || "");
    };

    const getIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return <Home className="w-3 h-3" />;
            case 'work': return <Briefcase className="w-3 h-3" />;
            default: return <MapPin className="w-3 h-3" />;
        }
    };

    // Renamed handleSubmit to onSubmit and adapted for react-hook-form
    async function onSubmit(data: DeliveryDetailsFormData) {
        setIsSubmitting(true);

        try {
            const { order } = await ordersApi.submitDeliveryDetails(orderId, data); // Use data from form
            onSuccess(order.deliveryDetails);
            toast.success("Delivery details saved!");
        } catch (error) {
            toast.error("Failed to save delivery details. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-indigo-400" /> Delivery Details
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                    Please provide your delivery information to proceed with payment.
                    <br />
                    <span className="text-xs text-yellow-500/80">Note: Delivery is currently only available within Nigeria.</span>
                </p>
            </div>

            {showSaved && savedAddresses.length > 0 && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10">
                    <h4 className="text-sm font-medium text-slate-400 mb-3 block">Saved Addresses</h4>
                    <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((addr) => (
                            <button
                                key={addr.id}
                                type="button"
                                onClick={() => handleSelectAddress(addr)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-indigo-500/50 transition-all text-xs text-white"
                            >
                                {getIcon(addr.label)}
                                <span>{addr.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                            <input
                                {...form.register("fullName")}
                                type="text"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Receiver's Name"
                            />
                            {form.formState.errors.fullName && <p className="text-xs text-red-400 mt-1">{form.formState.errors.fullName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                            <input
                                {...form.register("phone")}
                                type="tel"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="080..."
                            />
                            {form.formState.errors.phone && <p className="text-xs text-red-400 mt-1">{form.formState.errors.phone.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Delivery Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                        <input
                            {...form.register("address")}
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Street Address, Building, etc."
                        />
                        {form.formState.errors.address && <p className="text-xs text-red-400 mt-1">{form.formState.errors.address.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">City</label>
                        <input
                            {...form.register("city")}
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. Ikeja"
                        />
                        {form.formState.errors.city && <p className="text-xs text-red-400 mt-1">{form.formState.errors.city.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">State</label>
                        <select
                            {...form.register("state")}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                        >
                            <option value="">Select State</option>
                            <option value="Lagos">Lagos</option>
                            <option value="Abuja">Abuja</option>
                            <option value="Port Harcourt">Port Harcourt</option>
                            <option value="Other">Other</option>
                        </select>
                        {form.formState.errors.state && <p className="text-xs text-red-400 mt-1">{form.formState.errors.state.message}</p>}
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Country</label>
                        <input
                            type="text"
                            disabled
                            className="w-full bg-slate-800 border border-white/5 rounded-lg py-2.5 px-4 text-slate-400 cursor-not-allowed"
                            value="Nigeria"
                            readOnly
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Instructions (Optional)</label>
                    <input
                        {...form.register("instructions")}
                        type="text"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder="Nearest bus stop or recognizable building"
                    />
                </div>

                <div className="pt-4">
                    <GlowButton
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save Delivery Details"}
                    </GlowButton>
                </div>
            </form>
        </div>
    );
}
