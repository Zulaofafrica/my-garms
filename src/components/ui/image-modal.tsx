"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";

interface ImageModalProps {
    src: string | null;
    alt?: string;
    onClose: () => void;
}

export function ImageModal({ src, alt = "Image Preview", onClose }: ImageModalProps) {

    // Handle ESC key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        if (src) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Lock scroll
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [src, handleKeyDown]);

    if (!src) return null;

    const downloadImage = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            // Best effort filename
            const ext = src.split('.').pop()?.split('?')[0] || 'jpg';
            link.download = `image-download.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed", e);
            window.open(src, '_blank'); // Fallback
        }
    };

    return (
        <AnimatePresence>
            {src && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
                >
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                        <button
                            onClick={(e) => { e.stopPropagation(); downloadImage(); }}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            title="Download"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); window.open(src, '_blank'); }}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            title="Open Original"
                        >
                            <ExternalLink size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <motion.img
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        src={src}
                        alt={alt}
                        onClick={(e) => e.stopPropagation()} // Prevent close on image click
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
