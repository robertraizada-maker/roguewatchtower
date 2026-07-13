import type { Metadata } from "next";

import AllDecksClient from "./AllDecksClient";
import { getRankingDecks } from "@/lib/rogue-ranking";

export const metadata: Metadata = {
    title: "All Pokemon TCG Rogue Decks",
    description: "Browse Pokemon TCG rogue decks from the last 28 days by Rogue Rating.",
};

export default async function AllDecksPage() {
    const decks = await getRankingDecks();

    return (
        <main className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">All Pokemon TCG Rogue Decks</h1>
                <p className="mt-2 max-w-3xl leading-7 text-slate-600 sm:mt-3">
                    Browse every Pokemon TCG rogue deck found in the last 28 days of tournament results.
                    Decks are grouped by Rogue Rating, then ordered alphabetically.
                </p>
            </div>

            <AllDecksClient decks={decks} />
        </main>
    );
}
