"use client";

import { useState, useEffect } from "react";
import { GlowButton } from "@/components/ui/glow-button";
import { Home, Briefcase, MapPin, Plus, Trash2 } from "lucide-react";
import { addressesApi } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Address {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    isDefault: boolean;
}

export function SavedAddressesList() {
    const toast = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const data = await addressesApi.list();
            setAddresses(data.addresses);
        } catch (error) {
            console.error("Failed to load addresses", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await addressesApi.delete(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
            toast.success("Address removed");
        } catch (error) {
            toast.error("Failed to remove address");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await addressesApi.create(newAddress);
            setAddresses(prev => [res.address, ...prev]);
            setIsAdding(false);
            setNewAddress({ label: 'Home', fullName: '', phone: '', address: '', city: '', state: '' });
            toast.success("Address saved");
        } catch (error) {
            toast.error("Failed to save address");
        }
    };

    const getIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return <Home className="w-5 h-5 text-indigo-400" />;
            case 'work': return <Briefcase className="w-5 h-5 text-purple-400" />;
            default: return <MapPin className="w-5 h-5 text-slate-400" />;
        }
    };

    if (isLoading) return <div className="text-center p-4">Loading addresses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Saved Addresses</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-slate-900/50 p-6 rounded-xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Label</label>
                            <select
                                className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white"
                                value={newAddress.label}
                                onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                            >
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white"
                                value={newAddress.fullName}
                                onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Phone</label>
                            <input
                                type="tel"
                                className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white"
                                value={newAddress.phone}
                                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">City</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white"
                                value={newAddress.city}
                                onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-400 block mb-1">Street Address</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white"
                                value={newAddress.address}
                                onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-400 block mb-1">State</label>
                            <input
                                type="text"
                                className="w-full bg-slate-800 border border-white/10 rounded p-2 text-white"
                                value={newAddress.state}
                                onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="text-slate-400 hover:text-white text-sm"
                        >
                            Cancel
                        </button>
                        <GlowButton type="submit" variant="primary">
                            Save Address
                        </GlowButton>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {addresses.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-xl">
                        No saved addresses yet
                    </div>
                )}
                {addresses.map(addr => (
                    <div key={addr.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-start group">
                        <div className="flex gap-4">
                            <div className="mt-1">{getIcon(addr.label)}</div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-white">{addr.label}</h4>
                                    {addr.isDefault && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Default</span>}
                                </div>
                                <p className="text-sm text-slate-300 mt-1">{addr.address}</p>
                                <p className="text-xs text-slate-400">{addr.city}, {addr.state}</p>
                                <p className="text-xs text-slate-500 mt-1">{addr.fullName} • {addr.phone}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(addr.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
