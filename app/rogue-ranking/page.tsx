import type { Metadata } from "next";

import RogueRankingTable from "@/components/RogueRankingTable";
import { getRankingDecks } from "@/lib/rogue-ranking";

export const metadata: Metadata = {
    title: "Rogue Ranking",
    description: "Rank recent Rogue Watchtower deck results by rating and finish percentage.",
    alternates: {
        canonical: "/rogue-ranking",
    },
};

export default async function RogueRankingPage() {
    const decks = await getRankingDecks();

    return (
        <main className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold">
                    Rogue Ranking
                </h1>

                <p className="mt-3 max-w-none text-slate-600">
                    The best performing recent rogue decks, ranked by Rogue
                    Rating first and tournament finish percentage second.
                </p>
            </div>

            <RogueRankingTable decks={decks} selectedRange={7} />
        </main>
    );
}
