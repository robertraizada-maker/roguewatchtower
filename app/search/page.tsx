import type { Metadata } from "next";

import DeckSearch, { SearchableDeck } from "@/components/DeckSearch";
import { getAvailableDates, getRogueDecks } from "@/lib/api";
import { getRogueRating } from "@/lib/rogue-rating";

export const metadata: Metadata = {
    title: "Search Rogue Pokemon TCG Decks",
    description: "Search recent rogue Pokemon TCG decklists by Pokemon name.",
};

async function getSearchableDecks(): Promise<SearchableDeck[]> {
    const availableDates = await getAvailableDates();
    const dates = availableDates.dates.slice(0, 28);
    const dailyResults = await Promise.all(
        dates.map(async (date) => ({
            date,
            result: await getRogueDecks(date),
        }))
    );

    return dailyResults.flatMap(({ date, result }) =>
        result.rogueDecks.map((deck, index) => ({
            ...deck,
            reportDate: date,
            dailyRank: index + 1,
            rogueRating: getRogueRating(deck, index),
        }))
    );
}

export default async function SearchPage() {
    const decks = await getSearchableDecks();

    return (
        <main className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold">
                    Search Rogue Pokemon TCG Decks
                </h1>

                <p className="mt-3 max-w-none text-slate-600">
                    Search recent rogue decklists by Pokemon name and jump
                    straight to the matching decklist.
                </p>
            </div>

            <DeckSearch decks={decks} />
        </main>
    );
}