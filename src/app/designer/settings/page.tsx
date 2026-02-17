
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { designerApi } from "@/lib/api-client";
import { ArrowLeft, Save, Briefcase, Power, Layers, Wallet, MapPin, Phone, Building2, UserCircle, Pencil, X, BadgeCheck } from "lucide-react";
import { CATEGORIES, STYLES } from "@/components/design-flow/CategoryStyleForm";

import { SimpleImageUpload } from "@/components/ui/simple-image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { useToast } from "@/components/ui/toast";

export default function DesignerSettingsPage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editPayment, setEditPayment] = useState(true);

    const [formData, setFormData] = useState({
        status: 'available',
        maxCapacity: 5,
        specialties: [] as string[],
        currentLoad: 0,
        bankName: '',
        accountNumber: '',
        accountName: '',
        workshopAddress: '',
        phoneNumber: '',
        identificationUrl: '',
        profilePhoto: '',
        portfolioSamples: [] as string[],
        isVerified: false
    });

    const [newSpecialty, setNewSpecialty] = useState("");

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await designerApi.getSettings();
            if (data.profile) {
                const hasPaymentDetails = !!data.profile.bankName;
                setEditPayment(!hasPaymentDetails);

                setFormData({
                    status: data.profile.status,
                    maxCapacity: data.profile.maxCapacity,
                    specialties: data.profile.specialties || [],
                    currentLoad: data.profile.currentLoad,
                    bankName: data.profile.bankName || '',
                    accountNumber: data.profile.accountNumber || '',
                    accountName: data.profile.accountName || '',
                    workshopAddress: data.profile.workshopAddress || '',
                    phoneNumber: data.profile.phoneNumber || '',
                    identificationUrl: data.profile.identificationUrl || '',
                    profilePhoto: data.profile.profilePhoto || '',
                    portfolioSamples: data.profile.portfolioSamples || [],
                    isVerified: data.profile.isVerified || false
                });
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.bankName || !formData.accountNumber || !formData.identificationUrl) {
            toast.warning("Please fill in all mandatory fields (Bank, Account, NIN).");
            return;
        }
        setSaving(true);
        try {
            await designerApi.updateSettings({
                status: formData.status as any,
                maxCapacity: formData.maxCapacity,
                specialties: formData.specialties,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName,
                workshopAddress: formData.workshopAddress,
                phoneNumber: formData.phoneNumber,
                identificationUrl: formData.identificationUrl,
                profilePhoto: formData.profilePhoto,
                portfolioSamples: formData.portfolioSamples
            });
            toast.success("Settings saved successfully!");
            setEditPayment(false);
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleSpecialty = (item: string) => {
        setFormData(prev => {
            const exists = prev.specialties.includes(item);
            return {
                ...prev,
                specialties: exists
                    ? prev.specialties.filter(s => s !== item)
                    : [...prev.specialties, item]
            };
        });
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
                    {/* Profile & Portfolio Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-300">
                                <UserCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    Public Profile
                                    {formData.isVerified && (
                                        <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                                    )}
                                </h2>
                                <p className="text-slate-400 text-sm">How you appear to customers.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="max-w-xs mx-auto md:mx-0">
                                <SimpleImageUpload
                                    label="Profile Photo"
                                    value={formData.profilePhoto}
                                    onUpload={(url) => setFormData(prev => ({ ...prev, profilePhoto: url }))}
                                />
                            </div>

                            <div className="border-t border-white/5 pt-6">
                                <MultiImageUpload
                                    label="Portfolio Gallery"
                                    values={formData.portfolioSamples}
                                    onUpload={(urls) => setFormData(prev => ({ ...prev, portfolioSamples: urls }))}
                                    maxFiles={10}
                                />
                                <p className="text-xs text-slate-500 mt-2">Showcase your best work (Max 10 images).</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Card and others... */}
                    {/* ... Rest of existing JSX ... */}

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

                        <div className="space-y-8">
                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Outfit Categories</h3>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => {
                                        const isSelected = formData.specialties.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => toggleSpecialty(cat.id)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2
                                                    ${isSelected
                                                        ? 'bg-indigo-500 text-white border-indigo-500'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span>{cat.icon}</span>
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Styles */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Style Aesthetics</h3>
                                <div className="flex flex-wrap gap-2">
                                    {STYLES.map(style => {
                                        const isSelected = formData.specialties.includes(style.id);
                                        return (
                                            <button
                                                key={style.id}
                                                onClick={() => toggleSpecialty(style.id)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                                    ${isSelected
                                                        ? 'bg-purple-500 text-white border-purple-500'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {style.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal & Bank Details Card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-300">
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Payment & Verification</h2>
                                    <p className="text-slate-400 text-sm">Details for receiving payments and verifying your identity.</p>
                                </div>
                            </div>
                            {!editPayment && (
                                <button
                                    onClick={() => setEditPayment(true)}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                                    title="Edit Details"
                                >
                                    <Pencil size={20} />
                                </button>
                            )}
                        </div>

                        {editPayment ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                                            <Building2 size={14} /> Bank Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.bankName}
                                            onChange={e => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder="e.g. GTBank"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                                            <Wallet size={14} /> Account Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.accountNumber}
                                            onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder="0123456789"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                                        <UserCircle size={14} /> Account Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.accountName}
                                        onChange={e => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="Full Name on Account"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                                        <MapPin size={14} /> Workshop Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.workshopAddress}
                                        onChange={e => setFormData(prev => ({ ...prev, workshopAddress: e.target.value }))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                        placeholder="Full workshop/studio address"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                                            <Phone size={14} /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder="+234..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">
                                            NIN <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.identificationUrl}
                                            onChange={e => setFormData(prev => ({ ...prev, identificationUrl: e.target.value }))}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                                            placeholder="Enter your National Identity Number"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bank Name</p>
                                        <p className="text-white font-medium">{formData.bankName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Number</p>
                                        <p className="text-white font-mono text-lg">{formData.accountNumber}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-white/5 pt-4">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Name</p>
                                        <p className="text-white font-medium text-lg">{formData.accountName}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin size={14} className="text-slate-500" />
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">Workshop Address</p>
                                        </div>
                                        <p className="text-slate-300">{formData.workshopAddress}</p>
                                    </div>

                                    <div className="border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone size={14} className="text-slate-500" />
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">Contact Phone</p>
                                        </div>
                                        <p className="text-slate-300">{formData.phoneNumber}</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
