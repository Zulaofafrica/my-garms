"use client";

import { Gender } from "@/lib/types";
import { motion } from "framer-motion";

interface GenderSelectorProps {
    value: Gender;
    onChange: (gender: Gender) => void;
    disabled?: boolean;
}

export function GenderSelector({ value, onChange, disabled = false }: GenderSelectorProps) {
    return (
        <div className="gender-selector-container">
            <label className="gender-label">Select Gender</label>
            <div className="gender-toggle">
                <motion.button
                    type="button"
                    className={`gender-option ${value === 'male' ? 'active' : ''}`}
                    onClick={() => onChange('male')}
                    disabled={disabled}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="10" cy="14" r="5" />
                        <path d="M19 5l-5.4 5.4" />
                        <path d="M15 5h4v4" />
                    </svg>
                    <span>Male</span>
                </motion.button>

                <motion.button
                    type="button"
                    className={`gender-option ${value === 'female' ? 'active' : ''}`}
                    onClick={() => onChange('female')}
                    disabled={disabled}
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="8" r="5" />
                        <path d="M12 13v8" />
                        <path d="M9 18h6" />
                    </svg>
                    <span>Female</span>
                </motion.button>
            </div>

            <style jsx>{`
        .gender-selector-container {
          margin-bottom: 2rem;
        }

        .gender-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--muted-foreground);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .gender-toggle {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          background: var(--muted);
          border-radius: calc(var(--radius) + 4px);
        }

        .gender-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: var(--radius);
          background: transparent;
          color: var(--muted-foreground);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gender-option:hover:not(:disabled) {
          color: var(--foreground);
        }

        .gender-option.active {
          background: var(--background);
          color: var(--foreground);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .gender-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gender-option svg {
          width: 22px;
          height: 22px;
        }

        .gender-option.active svg {
          color: var(--accent);
        }
      `}</style>
        </div>
    );
}
