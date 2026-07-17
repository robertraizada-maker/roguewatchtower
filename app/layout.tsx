import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminHeaderBar from "@/components/AdminHeaderBar";

const siteUrl = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://roguewatchtower.com"
);

export const metadata: Metadata = {
    metadataBase: siteUrl,
    title: {
        default: "Best Rogue Pokémon TCG Decks | Rogue Watchtower",
        template: "%s | Rogue Watchtower",
    },
    description:
        "Discover rogue Pokemon TCG decks before they become part of the meta.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try{var t=localStorage.getItem("roguewatchtower:theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch{}`,
                    }}
                />
            </head>
            <body className="bg-gray-50 text-gray-900">
                <AdminHeaderBar />
                <Header />

                <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}

