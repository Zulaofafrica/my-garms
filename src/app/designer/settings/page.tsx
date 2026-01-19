
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { designerApi } from "@/lib/api-client";
import { ArrowLeft, Save, Briefcase, Power, Layers } from "lucide-react";

export default function DesignerSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        status: 'available',
        maxCapacity: 5,
        specialties: [] as string[],
        currentLoad: 0
    });

    const [newSpecialty, setNewSpecialty] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await designerApi.getSettings();
            if (data.profile) {
                setFormData({
                    status: data.profile.status,
                    maxCapacity: data.profile.maxCapacity,
                    specialties: data.profile.specialties || [],
                    currentLoad: data.profile.currentLoad
                });
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await designerApi.updateSettings({
                status: formData.status as any,
                maxCapacity: formData.maxCapacity,
                specialties: formData.specialties
            });
            alert("Settings saved successfully!");
        } catch (error) {
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const addSpecialty = () => {
        if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
            setFormData(prev => ({
                ...prev,
                specialties: [...prev.specialties, newSpecialty]
            }));
            setNewSpecialty("");
        }
    };

    const removeSpecialty = (item: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(s => s !== item)
        }));
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/designer')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                </div>

                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-300">
                                <Power size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Availability Status</h2>
                                <p className="text-slate-400 text-sm">Control your visibility for new requests.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {['available', 'busy', 'offline'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFormData(prev => ({ ...prev, status }))}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-all capitalize
                                        ${formData.status === status
                                            ? 'bg-indigo-600 border-indigo-500 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Capacity Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-300">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Workload Capacity</h2>
                                <p className="text-slate-400 text-sm">Maximum active orders you can handle.</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="flex justify-between text-sm text-slate-300 mb-2">
                                <span>Max Active Orders</span>
                                <span className="font-bold text-white">{formData.maxCapacity}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={formData.maxCapacity}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                                className="w-full accent-indigo-500"
                            />
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg flex justify-between items-center text-sm">
                            <span className="text-slate-400">Current Load</span>
                            <span className={`${formData.currentLoad >= formData.maxCapacity ? 'text-red-400' : 'text-green-400'} font-bold`}>
                                {formData.currentLoad} / {formData.maxCapacity}
                            </span>
                        </div>
                    </div>

                    {/* Specialties Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-pink-500/20 rounded-lg text-pink-300">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Specialties</h2>
                                <p className="text-slate-400 text-sm">Tags that help match you with relevant requests.</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSpecialty}
                                onChange={(e) => setNewSpecialty(e.target.value)}
                                placeholder="Add skill (e.g. Wedding, Suits)"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
                            />
                            <button
                                onClick={addSpecialty}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.specialties.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30 flex items-center gap-2">
                                    {tag}
                                    <button onClick={() => removeSpecialty(tag)} className="hover:text-white">&times;</button>
                                </span>
                            ))}
                            {formData.specialties.length === 0 && (
                                <span className="text-slate-500 text-sm italic">No specialties added yet.</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {saving ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save size={20} /> Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
