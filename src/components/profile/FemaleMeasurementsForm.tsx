"use client";

import { FemaleMeasurements, ClothingSize } from "@/lib/types";

interface FemaleMeasurementsFormProps {
    measurements: FemaleMeasurements;
    onChange: (measurements: FemaleMeasurements) => void;
}

const SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const DRESS_SIZES = ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20'];
const BOTTOM_SIZES = ['00', '0', '2', '4', '6', '8', '10', '12', '14', '16'];
const BRA_BANDS = ['28', '30', '32', '34', '36', '38', '40', '42', '44'];
const BRA_CUPS = ['AA', 'A', 'B', 'C', 'D', 'DD', 'E', 'F', 'G'];

export function FemaleMeasurementsForm({ measurements, onChange }: FemaleMeasurementsFormProps) {
    const handleChange = (field: keyof FemaleMeasurements, value: string) => {
        onChange({ ...measurements, [field]: value });
    };

    return (
        <div className="w-full">
            <div className="mb-8 text-center md:text-left">
                <h3 className="text-xl font-semibold text-white mb-2">Body Measurements</h3>
                <p className="text-slate-400 text-sm">Enter your measurements for the perfect fit</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {/* Height */}
                <div className="space-y-2">
                    <label htmlFor="height" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Height</label>
                    <div className="relative group">
                        <input
                            id="height"
                            type="number"
                            placeholder="165"
                            value={measurements.height || ''}
                            onChange={(e) => handleChange('height', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">cm</span>
                    </div>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                    <label htmlFor="weight" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Weight</label>
                    <div className="relative group">
                        <input
                            id="weight"
                            type="number"
                            placeholder="60"
                            value={measurements.weight || ''}
                            onChange={(e) => handleChange('weight', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">kg</span>
                    </div>
                </div>

                {/* Tops Size */}
                <div className="space-y-2">
                    <label htmlFor="topsSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Tops Size</label>
                    <div className="relative">
                        <select
                            id="topsSize"
                            value={measurements.topsSize || ''}
                            onChange={(e) => handleChange('topsSize', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
                        >
                            <option value="" className="bg-slate-900 text-slate-400">Select size</option>
                            {SIZES.map((size) => (
                                <option key={size} value={size} className="bg-slate-900">{size}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                {/* Bottom Size */}
                <div className="space-y-2">
                    <label htmlFor="bottomSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Bottom Size</label>
                    <div className="relative">
                        <select
                            id="bottomSize"
                            value={measurements.bottomSize || ''}
                            onChange={(e) => handleChange('bottomSize', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
                        >
                            <option value="" className="bg-slate-900 text-slate-400">Select size</option>
                            {BOTTOM_SIZES.map((size) => (
                                <option key={size} value={size} className="bg-slate-900">{size}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                {/* Dress Size */}
                <div className="space-y-2">
                    <label htmlFor="dressSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Dress Size</label>
                    <div className="relative">
                        <select
                            id="dressSize"
                            value={measurements.dressSize || ''}
                            onChange={(e) => handleChange('dressSize', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
                        >
                            <option value="" className="bg-slate-900 text-slate-400">Select size</option>
                            {DRESS_SIZES.map((size) => (
                                <option key={size} value={size} className="bg-slate-900">{size}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                {/* Waist Size */}
                <div className="space-y-2">
                    <label htmlFor="waistSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Waist Size</label>
                    <div className="relative group">
                        <input
                            id="waistSize"
                            type="number"
                            placeholder="28"
                            value={measurements.waistSize || ''}
                            onChange={(e) => handleChange('waistSize', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">in</span>
                    </div>
                </div>

                {/* Inseam */}
                <div className="space-y-2">
                    <label htmlFor="inseam" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Inseam</label>
                    <div className="relative group">
                        <input
                            id="inseam"
                            type="number"
                            placeholder="30"
                            value={measurements.inseam || ''}
                            onChange={(e) => handleChange('inseam', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">in</span>
                    </div>
                </div>

                {/* Bra Size - Combined */}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-400 font-medium">Bra Size</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={(measurements.braSize || '').match(/^\d+/)?.[0] || ''}
                                onChange={(e) => {
                                    const cup = (measurements.braSize || '').match(/[A-Z]+$/)?.[0] || '';
                                    handleChange('braSize', `${e.target.value}${cup}`);
                                }}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
                            >
                                <option value="" className="bg-slate-900 text-slate-400">Band</option>
                                {BRA_BANDS.map((band) => (
                                    <option key={band} value={band} className="bg-slate-900">{band}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                        <div className="relative flex-1">
                            <select
                                value={(measurements.braSize || '').match(/[A-Z]+$/)?.[0] || ''}
                                onChange={(e) => {
                                    const band = (measurements.braSize || '').match(/^\d+/)?.[0] || '';
                                    handleChange('braSize', `${band}${e.target.value}`);
                                }}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
                            >
                                <option value="" className="bg-slate-900 text-slate-400">Cup</option>
                                {BRA_CUPS.map((cup) => (
                                    <option key={cup} value={cup} className="bg-slate-900">{cup}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shoe Size */}
                <div className="space-y-2">
                    <label htmlFor="shoeSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Shoe Size</label>
                    <div className="relative group">
                        <input
                            id="shoeSize"
                            type="number"
                            placeholder="39"
                            value={measurements.shoeSize || ''}
                            onChange={(e) => handleChange('shoeSize', e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">EU</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
