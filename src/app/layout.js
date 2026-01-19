import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/UI/Navbar";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

export const metadata = {
    title: "MyGarms | Custom Outfit Design",
    description: "Design, visualize, and order custom-made clothing online.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${playfair.variable} antialiased`}>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
