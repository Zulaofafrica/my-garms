"use client";

import { useState, useEffect } from "react";
import styles from "./profile.module.css";
import { Save, User as UserIcon, Package, Check, Palette, LogOut, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ProfileSelector,
    GenderSelector,
    MaleMeasurementsForm,
    FemaleMeasurementsForm,
    AddProfileModal,
    SavedAddressesList,
} from "@/components/profile";
import {
    Gender,
    MaleMeasurements,
    FemaleMeasurements,
    getDefaultMaleMeasurements,
    getDefaultFemaleMeasurements,
} from "@/lib/types";
import { profilesApi, ordersApi, authApi, Profile as ApiProfile, Order as ApiOrder } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";

export default function ProfilePage() {
    const router = useRouter();
    const toast = useToast();
    const [view, setView] = useState<"measurements" | "orders" | "addresses">("measurements");
    const [profiles, setProfiles] = useState<ApiProfile[]>([]);
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [isLoading, setIsLoading] = useState(true);

    // Initial load: Auth, Profiles, and Orders
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Check auth first
                const me = await authApi.me();

                // Redirect designers to their portal
                if (me.user.role === 'designer') {
                    router.push('/designer');
                    return;
                }

                // Fetch profiles and orders in parallel
                const [profilesData, ordersData] = await Promise.all([
                    profilesApi.list(),
                    ordersApi.list()
                ]);

                setProfiles(profilesData.profiles);
                setOrders(ordersData.orders);

                if (profilesData.profiles.length > 0) {
                    setActiveProfileId(profilesData.profiles[0].id);
                }

                setIsLoading(false);
            } catch (err: any) {
                // If 401/Not authenticated, redirect to login
                if (err.message === 'Not authenticated' || err.message?.includes('Unauthorized')) {
                    router.push("/auth/login");
                } else {
                    console.error("Failed to load initial data:", err);
                    router.push("/auth/login"); // Fallback redirect
                }
            } finally {
                // Only stop loading if we aren't redirecting (though redirect will unmount this anyway)
                // If we redirected, we can leave loading true to prevent flash of content
            }
        };

        loadInitialData();
    }, [router]);

    const activeProfile = profiles.find((p) => p.id === activeProfileId);

    const handleAddProfile = async (name: string, gender: Gender) => {
        try {
            const data = await profilesApi.create({
                name,
                gender,
                measurements: (gender === "male"
                    ? getDefaultMaleMeasurements()
                    : getDefaultFemaleMeasurements()) as unknown as Record<string, string>
            });

            setProfiles((prev) => [...prev, data.profile]);
            setActiveProfileId(data.profile.id);
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create profile");
        }
    };

    const handleDeleteProfile = async (profileId: string) => {
        try {
            await profilesApi.delete(profileId);
            setProfiles((prev) => {
                const updated = prev.filter((p) => p.id !== profileId);
                if (activeProfileId === profileId) {
                    setActiveProfileId(updated.length > 0 ? updated[0].id : null);
                }
                return updated;
            });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete profile");
        }
    };

    const handleMeasurementsChange = (
        measurements: MaleMeasurements | FemaleMeasurements
    ) => {
        if (!activeProfileId) return;

        setProfiles((prev) =>
            prev.map((p) =>
                p.id === activeProfileId
                    ? { ...p, measurements: measurements as unknown as Record<string, string>, updatedAt: new Date().toISOString() }
                    : p
            )
        );
    };

    const handleGenderChange = async (gender: Gender) => {
        if (!activeProfileId || !activeProfile) return;

        const newMeasurements = gender === "male"
            ? getDefaultMaleMeasurements()
            : getDefaultFemaleMeasurements();

        try {
            const data = await profilesApi.update(activeProfileId, {
                gender,
                measurements: newMeasurements as unknown as Record<string, string>
            });

            setProfiles((prev) =>
                prev.map((p) => p.id === activeProfileId ? data.profile : p)
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to change gender");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProfileId || !activeProfile) return;

        setSaveStatus("saving");

        try {
            await profilesApi.update(activeProfileId, {
                measurements: activeProfile.measurements as unknown as Record<string, string>
            });
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save measurements");
            setSaveStatus("idle");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className={styles.loadingContainer}>
                    <div className={styles.spinnerLarge} />
                    <p>Loading your wardrobe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white dark">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <header className="py-16 pb-8 border-b border-white/10 mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                        My Wardrobe
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Manage your measurements and track your orders.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 pb-16">
                    {/* Sidebar */}
                    <aside className="flex flex-col gap-2 min-h-[480px]">
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${view === "measurements"
                                ? "bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            onClick={() => setView("measurements")}
                        >
                            <UserIcon size={20} />
                            <span>Profile & Measurements</span>
                        </div>
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${view === "orders"
                                ? "bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            onClick={() => setView("orders")}
                        >
                            <Package size={20} />
                            <span>Orders</span>
                        </div>
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${view === "addresses"
                                ? "bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            onClick={() => setView("addresses")}
                        >
                            <MapPin size={20} />
                            <span>Saved Addresses</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-white/10">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium" onClick={() => {
                                authApi.logout().then(() => {
                                    router.push("/");
                                    router.refresh();
                                });
                            }}>
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <main>
                        {view === "measurements" ? (
                            <section>
                                {/* Profile Selector */}
                                <ProfileSelector
                                    profiles={profiles as any}
                                    activeProfileId={activeProfileId}
                                    onSelectProfile={setActiveProfileId}
                                    onAddProfile={() => setIsModalOpen(true)}
                                    onDeleteProfile={handleDeleteProfile}
                                />

                                {activeProfile ? (
                                    <form onSubmit={handleSave}>
                                        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
                                            {/* Gender Selector */}
                                            <GenderSelector
                                                value={activeProfile.gender}
                                                onChange={handleGenderChange}
                                            />

                                            {/* Measurements Form based on gender */}
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeProfile.gender}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {activeProfile.gender === "male" ? (
                                                        <MaleMeasurementsForm
                                                            measurements={activeProfile.measurements as any}
                                                            onChange={handleMeasurementsChange}
                                                        />
                                                    ) : (
                                                        <FemaleMeasurementsForm
                                                            measurements={activeProfile.measurements as any}
                                                            onChange={handleMeasurementsChange}
                                                        />
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>

                                            {/* Save Button */}
                                            <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-end gap-4">
                                                <Link href="/design" className="no-underline">
                                                    <button
                                                        type="button"
                                                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all font-medium"
                                                    >
                                                        <Palette size={18} />
                                                        Create a Design
                                                    </button>
                                                </Link>
                                                <motion.button
                                                    type="submit"
                                                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    disabled={saveStatus === "saving"}
                                                >
                                                    {saveStatus === "saving" ? (
                                                        <>
                                                            <div className={styles.spinner} />
                                                            Saving...
                                                        </>
                                                    ) : saveStatus === "saved" ? (
                                                        <>
                                                            <Check size={18} />
                                                            Saved!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={18} />
                                                            Save Measurements
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/50 border-2 border-dashed border-white/10 rounded-2xl text-center">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-400 mb-6">
                                            <UserIcon size={40} />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No Profiles Yet</h3>
                                        <p className="text-slate-400 mb-6">Create a profile to save your measurements</p>
                                        <button
                                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            Create Your First Profile
                                        </button>
                                    </div>
                                )}
                            </section>
                        ) : view === "orders" ? (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 text-white">Order History</h2>
                                <div className="space-y-4">
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <div key={order.id} className="bg-slate-900/50 border border-white/10 rounded-xl p-6 transition-all hover:bg-slate-900/80 hover:border-white/20 group">
                                                <div className="flex justify-between mb-4">
                                                    <span className="font-mono text-slate-500 text-sm">{order.id}</span>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "delivered"
                                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            }`}
                                                    >
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">{order.templateName} ({order.fabricName})</h3>
                                                    <p className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                                    <span className="font-semibold text-lg text-white">
                                                        {order.price ? `₦${order.price.toLocaleString()}` : 'Calculating...'}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {order.disputeStatus && order.disputeStatus !== 'none' && (
                                                            <Link href={`/dashboard/${order.id}/dispute`}>
                                                                <button className="px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all">
                                                                    Dispute
                                                                </button>
                                                            </Link>
                                                        )}
                                                        <Link href={`/dashboard/${order.id}`}>
                                                            <button className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 hover:border-white/20 text-sm font-medium transition-all">
                                                                Details
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/50 border-2 border-dashed border-white/10 rounded-2xl text-center">
                                            <p className="text-slate-400 mb-4">You haven't placed any orders yet.</p>
                                            <Link href="/design">
                                                <button className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all">
                                                    Start Your First Design
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </section>
                        ) : (
                            <section>
                                <SavedAddressesList />
                            </section>
                        )}
                    </main>
                </div>
            </div>

            {/* Add Profile Modal */}
            <AddProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddProfile}
            />
        </div>
    );
}
