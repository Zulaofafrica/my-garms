"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SimpleImageUploadProps {
    onUpload: (url: string) => void;
    label?: string;
    value?: string; // Pre-existing URL
}

export function SimpleImageUpload({ onUpload, label, value }: SimpleImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string>(value || "");

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) throw new Error("Upload failed");

                const data = await res.json();
                setPreview(data.url);
                onUpload(data.url);
            } catch (error) {
                console.error("Upload error:", error);
                alert("Failed to upload image.");
            } finally {
                setIsUploading(false);
            }
        },
        [onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxFiles: 1,
    });

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview("");
        onUpload("");
    };

    return (
        <div className="space-y-2">
            {label && <p className="text-sm font-medium text-white">{label}</p>}

            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 overflow-hidden",
                    isDragActive
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10",
                    preview ? "aspect-auto p-0" : "p-8"
                )}
            >
                <input {...getInputProps()} />

                {preview ? (
                    <div className="relative w-full">
                        <img src={preview} alt="Uploaded" className="w-full h-auto max-h-64 object-contain bg-black/40" />
                        <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                        ) : (
                            <div className="bg-white/10 p-3 rounded-full mb-3">
                                <UploadCloud className="w-6 h-6 text-indigo-400" />
                            </div>
                        )}
                        <p className="text-sm font-medium text-white">
                            {isUploading ? "Uploading..." : isDragActive ? "Drop image here" : "Click or Drag Image"}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
