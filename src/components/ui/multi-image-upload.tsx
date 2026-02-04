"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface MultiImageUploadProps {
    onUpload: (urls: string[]) => void;
    label?: string;
    values?: string[]; // Pre-existing URLs
    maxFiles?: number;
}

export function MultiImageUpload({ onUpload, label, values = [], maxFiles = 10 }: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [urls, setUrls] = useState<string[]>(values);
    const toast = useToast();

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (urls.length + acceptedFiles.length > maxFiles) {
                toast.warning(`You can only upload up to ${maxFiles} images.`);
                return;
            }

            setIsUploading(true);
            try {
                const uploadedUrls: string[] = [];

                // Upload sequentially to avoid overwhelming server or hitting limits
                for (const file of acceptedFiles) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) throw new Error("Upload failed for one or more files");

                    const data = await res.json();
                    uploadedUrls.push(data.url);
                }

                const newUrls = [...urls, ...uploadedUrls];
                setUrls(newUrls);
                onUpload(newUrls);
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload some images.");
            } finally {
                setIsUploading(false);
            }
        },
        [onUpload, urls, maxFiles, toast]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        maxFiles: maxFiles - urls.length,
        disabled: isUploading || urls.length >= maxFiles,
    });

    const removeImage = (indexToRemove: number) => {
        const newUrls = urls.filter((_, i) => i !== indexToRemove);
        setUrls(newUrls);
        onUpload(newUrls);
    };

    return (
        <div className="space-y-4">
            {label && <p className="text-sm font-medium text-white">{label} <span className="text-slate-500 text-xs">({urls.length}/{maxFiles})</span></p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {urls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-white/10 group">
                        <img
                            src={url}
                            alt={`Portfolio ${i + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {urls.length < maxFiles && (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200",
                            isDragActive
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10",
                            (isUploading || urls.length >= maxFiles) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <input {...getInputProps()} />
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                        ) : (
                            <>
                                <UploadCloud className="w-6 h-6 text-indigo-400 mb-2" />
                                <span className="text-xs text-slate-400 font-medium">Add Image</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
