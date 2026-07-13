import type { Metadata } from "next";
import { notFound } from "next/navigation";

import RogueRankingTable from "@/components/RogueRankingTable";
import { getRankingDecks } from "@/lib/rogue-ranking";
import {
    getRankingRangeHref,
    parseRankingRange,
    RANKING_RANGE_OPTIONS,
} from "@/lib/ranking-ranges";

interface Props {
    params: Promise<{
        range: string;
    }>;
}

export function generateStaticParams() {
    return RANKING_RANGE_OPTIONS.map((range) => ({
        range: `${range}days`,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { range: rangeParam } = await params;
    const range = parseRankingRange(rangeParam);

    if (!range) {
        return {
            title: "Rogue Ranking",
        };
    }

    return {
        title: `Rogue Ranking - Last ${range} Days`,
        description: `Rank Rogue Watchtower deck results from the last ${range} days by rating and finish percentage.`,
        alternates: {
            canonical: getRankingRangeHref(range),
        },
    };
}

export default async function RogueRankingRangePage({ params }: Props) {
    const { range: rangeParam } = await params;
    const range = parseRankingRange(rangeParam);

    if (!range) {
        notFound();
    }

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

            <RogueRankingTable decks={decks} selectedRange={range} />
        </main>
    );
}
