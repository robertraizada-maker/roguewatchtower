import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: {
        default: "Rogue Watchtower",
        template: "%s | Rogue Watchtower",
    },
    description:
        "Discover rogue Pokémon TCG decks before they become part of the meta.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-gray-50 text-gray-900">
                <Header />

                <main className="mx-auto max-w-7xl px-6 py-8">
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}