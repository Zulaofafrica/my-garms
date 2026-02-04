"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmProvider } from "@/components/ui/confirm-modal";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <ConfirmProvider>
                    {children}
                </ConfirmProvider>
            </ToastProvider>
        </AuthProvider>
    );
}
