import { getAvailableDates, getRogueDecks } from "@/lib/api";
import { getRogueRating } from "@/lib/rogue-rating";
import { RogueDeck } from "@/types/rogue";

export type { RankingRange } from "@/lib/ranking-ranges";

export type RankingDeck = RogueDeck & {
    reportDate: string;
    dateIndex: number;
    dailyRank: number;
    rogueRating: number;
};

export async function getRankingDecks(): Promise<RankingDeck[]> {
    const availableDates = await getAvailableDates();
    const dates = availableDates.dates.slice(0, 28);
    const dailyResults = await Promise.all(
        dates.map(async (date, dateIndex) => ({
            date,
            dateIndex,
            result: await getRogueDecks(date),
        }))
    );

    return dailyResults.flatMap(({ date, dateIndex, result }) =>
        result.rogueDecks.map((deck, index) => ({
            ...deck,
            reportDate: date,
            dateIndex,
            dailyRank: index + 1,
            rogueRating: getRogueRating(deck, index),
        }))
    );
}
