import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";

// const outfit = Outfit({
//   subsets: ["latin"],
//   display: 'swap',
//   adjustFontFallback: false,
//   variable: "--font-sans",
// });
// const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyGarms - Design Your Look",
  description: "Premium custom outfit design platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="flex-1 overflow-visible">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
