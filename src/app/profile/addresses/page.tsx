import { SavedAddressesList } from "@/components/profile/saved-addresses-list";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddressesPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Profile
            </Link>

            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 md:p-8">
                <SavedAddressesList />
            </div>
        </div>
    );
}
