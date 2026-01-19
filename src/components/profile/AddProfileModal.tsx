"use client";

import { useState } from "react";
import { Gender } from "@/lib/types";
import { GenderSelector } from "./GenderSelector";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, gender: Gender) => void;
}

export function AddProfileModal({ isOpen, onClose, onAdd }: AddProfileModalProps) {
    const [name, setName] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter a profile name");
            return;
        }

        onAdd(name.trim(), gender);
        setName("");
        setGender("male");
        setError("");
        onClose();
    };

    const handleClose = () => {
        setName("");
        setGender("male");
        setError("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />
                    <motion.div
                        className="modal-container"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="modal-header">
                            <h2>Add New Profile</h2>
                            <button className="close-btn" onClick={handleClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-field">
                                <label htmlFor="profileName">Profile Name</label>
                                <input
                                    id="profileName"
                                    type="text"
                                    placeholder="e.g., John, Mom, Dad..."
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError("");
                                    }}
                                    autoFocus
                                />
                                {error && <span className="error-message">{error}</span>}
                            </div>

                            <GenderSelector
                                value={gender}
                                onChange={setGender}
                            />

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    <style jsx>{`
            .modal-backdrop {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              z-index: 100;
            }

            .modal-container {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 90%;
              max-width: 480px;
              background: var(--background);
              border-radius: calc(var(--radius) + 4px);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              z-index: 101;
              overflow: hidden;
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1.5rem;
              border-bottom: 1px solid var(--border);
            }

            .modal-header h2 {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 0;
            }

            .close-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 36px;
              height: 36px;
              border: none;
              background: transparent;
              border-radius: var(--radius);
              color: var(--muted-foreground);
              cursor: pointer;
              transition: all 0.2s;
            }

            .close-btn:hover {
              background: var(--muted);
              color: var(--foreground);
            }

            .modal-form {
              padding: 1.5rem;
            }

            .form-field {
              margin-bottom: 1.5rem;
            }

            .form-field label {
              display: block;
              font-size: 0.8rem;
              font-weight: 600;
              color: var(--muted-foreground);
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 0.5rem;
            }

            .form-field input {
              width: 100%;
              padding: 0.875rem 1rem;
              border: 1px solid var(--border);
              border-radius: var(--radius);
              background: var(--background);
              color: var(--foreground);
              font-size: 1rem;
              transition: all 0.2s ease;
            }

            .form-field input:focus {
              outline: none;
              border-color: var(--accent);
              box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.1);
            }

            .form-field input::placeholder {
              color: var(--muted-foreground);
              opacity: 0.6;
            }

            .error-message {
              display: block;
              margin-top: 0.5rem;
              font-size: 0.8rem;
              color: #dc2626;
            }

            .modal-actions {
              display: flex;
              justify-content: flex-end;
              gap: 0.75rem;
              margin-top: 2rem;
              padding-top: 1.5rem;
              border-top: 1px solid var(--border);
            }

            .btn-secondary {
              padding: 0.75rem 1.25rem;
              border: 1px solid var(--border);
              border-radius: var(--radius);
              background: transparent;
              color: var(--foreground);
              font-size: 0.9rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }

            .btn-secondary:hover {
              background: var(--muted);
            }

            .btn-primary {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: var(--radius);
              background: var(--accent);
              color: white;
              font-size: 0.9rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }

            .btn-primary:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }
          `}</style>
                </>
            )}
        </AnimatePresence>
    );
}
