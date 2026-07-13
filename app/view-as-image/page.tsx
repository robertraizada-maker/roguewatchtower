import type { Metadata } from "next";

import ViewAsImageDeck from "@/components/ViewAsImageDeck";

export const metadata: Metadata = {
    title: "View Pokemon TCG Deck as Image",
    description: "View a Pokemon TCG decklist as a grid of card images.",
};

export default function ViewAsImagePage() {
    return <ViewAsImageDeck />;
}