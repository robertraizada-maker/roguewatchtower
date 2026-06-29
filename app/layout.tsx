import type { Metadata } from "next";
import "./globals.css";

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
            <body>{children}</body>
        </html>
    );
}