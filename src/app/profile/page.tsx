"use client";

import { useState, useEffect } from "react";
import styles from "./profile.module.css";
import { Save, User as UserIcon, Package, Check, Palette, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ProfileSelector,
    GenderSelector,
    MaleMeasurementsForm,
    FemaleMeasurementsForm,
    AddProfileModal,
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

export default function ProfilePage() {
    const router = useRouter();
    const [view, setView] = useState<"measurements" | "orders">("measurements");
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
            } catch (err) {
                console.error("Failed to load initial data:", err);
                router.push("/auth/login");
            } finally {
                setIsLoading(false);
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
            alert(err instanceof Error ? err.message : "Failed to create profile");
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
            alert(err instanceof Error ? err.message : "Failed to delete profile");
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
            alert(err instanceof Error ? err.message : "Failed to change gender");
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
            alert(err instanceof Error ? err.message : "Failed to save measurements");
            setSaveStatus("idle");
        }
    };

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinnerLarge} />
                    <p>Loading your wardrobe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Wardrobe</h1>
                <p className={styles.subtitle}>
                    Manage your measurements and track your orders.
                </p>
            </header>

            <div className={styles.grid}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div
                        className={`${styles.menuItem} ${view === "measurements" ? styles.active : ""}`}
                        onClick={() => setView("measurements")}
                    >
                        <UserIcon size={20} />
                        <span>Profile & Measurements</span>
                    </div>
                    <div
                        className={`${styles.menuItem} ${view === "orders" ? styles.active : ""}`}
                        onClick={() => setView("orders")}
                    >
                        <Package size={20} />
                        <span>Orders</span>
                    </div>
                    <div className={styles.sidebarBottom}>
                        <button className={styles.logoutBtn} onClick={() => {
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
                <main className={styles.content}>
                    {view === "measurements" ? (
                        <section className={styles.section}>
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
                                    <div className={styles.profileEditor}>
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
                                        <div className={styles.saveSection}>
                                            <Link href="/design" className={styles.designLink}>
                                                <button
                                                    type="button"
                                                    className={styles.designButton}
                                                >
                                                    <Palette size={18} />
                                                    Create a Design
                                                </button>
                                            </Link>
                                            <motion.button
                                                type="submit"
                                                className={styles.saveButton}
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
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <UserIcon size={48} />
                                    </div>
                                    <h3>No Profiles Yet</h3>
                                    <p>Create a profile to save your measurements</p>
                                    <button
                                        className={styles.createFirstBtn}
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Create Your First Profile
                                    </button>
                                </div>
                            )}
                        </section>
                    ) : (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Order History</h2>
                            <div className={styles.ordersList}>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <div key={order.id} className={styles.orderCard}>
                                            <div className={styles.orderHeader}>
                                                <span className={styles.orderId}>{order.id}</span>
                                                <span
                                                    className={`${styles.status} ${order.status === "delivered"
                                                        ? styles.statusDone
                                                        : styles.statusActive
                                                        }`}
                                                >
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className={styles.orderDetails}>
                                                <h3>{order.templateName} ({order.fabricName})</h3>
                                                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className={styles.orderFooter}>
                                                <span className={styles.orderPrice}>
                                                    {order.price ? `₦${order.price.toLocaleString()}` : 'Calculating...'}
                                                </span>
                                                {order.disputeStatus && order.disputeStatus !== 'none' && (
                                                    <Link href={`/dashboard/${order.id}/dispute`}>
                                                        <button className={`${styles.trackBtn} bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20`}>
                                                            Dispute
                                                        </button>
                                                    </Link>
                                                )}
                                                <Link href={`/dashboard/${order.id}`}>
                                                    <button className={styles.trackBtn}>Details</button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <p>You haven't placed any orders yet.</p>
                                        <Link href="/design">
                                            <button className={styles.createFirstBtn} style={{ marginTop: '1rem' }}>
                                                Start Your First Design
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </main>
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
