"use client";

import { MaleMeasurements, ClothingSize } from "@/lib/types";

interface MaleMeasurementsFormProps {
  measurements: MaleMeasurements;
  onChange: (measurements: MaleMeasurements) => void;
}

const SHIRT_SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export function MaleMeasurementsForm({ measurements, onChange }: MaleMeasurementsFormProps) {
  const handleChange = (field: keyof MaleMeasurements, value: string) => {
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
              placeholder="175"
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
              placeholder="75"
              value={measurements.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">kg</span>
          </div>
        </div>

        {/* Shirt Size */}
        <div className="space-y-2">
          <label htmlFor="shirtSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Shirt Size</label>
          <div className="relative">
            <select
              id="shirtSize"
              value={measurements.shirtSize || ''}
              onChange={(e) => handleChange('shirtSize', e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-400">Select size</option>
              {SHIRT_SIZES.map((size) => (
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
              placeholder="32"
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

        {/* Blazer Size */}
        <div className="space-y-2">
          <label htmlFor="blazerSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Blazer Size</label>
          <div className="relative group">
            <input
              id="blazerSize"
              type="number"
              placeholder="40"
              value={measurements.blazerSize || ''}
              onChange={(e) => handleChange('blazerSize', e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium bg-white/5 px-2 py-0.5 rounded">R</span>
          </div>
        </div>

        {/* Shoe Size */}
        <div className="space-y-2">
          <label htmlFor="shoeSize" className="text-xs uppercase tracking-widest text-slate-400 font-medium">Shoe Size</label>
          <div className="relative group">
            <input
              id="shoeSize"
              type="number"
              placeholder="42"
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
