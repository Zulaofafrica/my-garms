"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
    name: string;
}

export function ImageUpload({ name }: ImageUploadProps) {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const files = watch(name) as File[];

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newFiles = [...(files || []), ...acceptedFiles];
            setValue(name, newFiles, { shouldValidate: true });
        },
        [files, setValue, name]
    );

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setValue(name, newFiles, { shouldValidate: true });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
        maxFiles: 5,
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200",
                    isDragActive
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10",
                    errors[name] && "border-red-500/50 bg-red-500/5"
                )}
            >
                <input {...getInputProps()} />
                <div className="bg-white/10 p-4 rounded-full mb-4">
                    <UploadCloud className="w-8 h-8 text-accent" />
                </div>
                <p className="text-lg font-medium text-white">
                    {isDragActive ? "Drop files here" : "Drag & drop your inspiration"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Supports JPG, PNG, WEBP (Max 5 files)
                </p>
            </div>

            {errors[name] && (
                <p className="text-sm text-red-400 text-center">{errors[name]?.message as string}</p>
            )}

            {/* Previews */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                    {files?.map((file, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-white/10 group"
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
