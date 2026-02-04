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
    <div className="measurements-form">
      <div className="form-header">
        <h3>Body Measurements</h3>
        <p>Enter your measurements for the perfect fit</p>
      </div>

      <div className="form-grid">
        {/* Height */}
        <div className="form-field">
          <label htmlFor="height">Height</label>
          <div className="input-with-unit">
            <input
              id="height"
              type="number"
              placeholder="175"
              value={measurements.height || ''}
              onChange={(e) => handleChange('height', e.target.value)}
            />
            <span className="unit">cm</span>
          </div>
        </div>

        {/* Weight */}
        <div className="form-field">
          <label htmlFor="weight">Weight</label>
          <div className="input-with-unit">
            <input
              id="weight"
              type="number"
              placeholder="75"
              value={measurements.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value)}
            />
            <span className="unit">kg</span>
          </div>
        </div>

        {/* Shirt Size */}
        <div className="form-field">
          <label htmlFor="shirtSize">Shirt Size</label>
          <select
            id="shirtSize"
            value={measurements.shirtSize || ''}
            onChange={(e) => handleChange('shirtSize', e.target.value)}
          >
            <option value="">Select size</option>
            {SHIRT_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Waist Size */}
        <div className="form-field">
          <label htmlFor="waistSize">Waist Size</label>
          <div className="input-with-unit">
            <input
              id="waistSize"
              type="number"
              placeholder="32"
              value={measurements.waistSize || ''}
              onChange={(e) => handleChange('waistSize', e.target.value)}
            />
            <span className="unit">in</span>
          </div>
        </div>

        {/* Inseam */}
        <div className="form-field">
          <label htmlFor="inseam">Inseam</label>
          <div className="input-with-unit">
            <input
              id="inseam"
              type="number"
              placeholder="30"
              value={measurements.inseam || ''}
              onChange={(e) => handleChange('inseam', e.target.value)}
            />
            <span className="unit">in</span>
          </div>
        </div>

        {/* Blazer Size */}
        <div className="form-field">
          <label htmlFor="blazerSize">Blazer Size</label>
          <div className="input-with-unit">
            <input
              id="blazerSize"
              type="number"
              placeholder="40"
              value={measurements.blazerSize || ''}
              onChange={(e) => handleChange('blazerSize', e.target.value)}
            />
            <span className="unit">R</span>
          </div>
        </div>

        {/* Shoe Size */}
        <div className="form-field">
          <label htmlFor="shoeSize">Shoe Size</label>
          <div className="input-with-unit">
            <input
              id="shoeSize"
              type="number"
              placeholder="10"
              value={measurements.shoeSize || ''}
              onChange={(e) => handleChange('shoeSize', e.target.value)}
            />
            <span className="unit">US</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .measurements-form {
          background: var(--background);
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .form-header p {
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-field label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-with-unit {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-unit input {
          width: 100%;
          padding: 0.75rem 1rem;
          padding-right: 3rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          color: var(--foreground);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .input-with-unit input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
        }

        .input-with-unit input::placeholder {
          color: var(--muted-foreground);
          opacity: 0.5;
        }

        .unit {
          position: absolute;
          right: 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--muted-foreground);
          background: var(--muted);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          color: var(--foreground);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
        }

        /* Hide number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
