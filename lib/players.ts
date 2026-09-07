import { cache } from "react";
import { getAvailableDates, getRogueDecks } from "@/lib/api";
import { getRogueRating } from "@/lib/rogue-rating";
import { buildPlayerStandings, getPlayerWindow } from "@/lib/player-standings";

export const getPlayers = cache(async () => {
    const { dates } = await getAvailableDates();
    const endDate = [...dates].sort().at(-1);
    if (!endDate) return { players: [], window: null };
    const window = getPlayerWindow(endDate);
    const featuredDates = [...new Set(dates)].filter((date) =>
        date >= window.startDate && date <= window.endDate
    ).sort().reverse();
    const decks = [];
    // Reuse exactly the displayed daily top five, including decklist hydration.
    for (const [dateIndex, reportDate] of featuredDates.entries()) {
        const result = await getRogueDecks(reportDate);
        decks.push(...result.rogueDecks.slice(0, 5).map((deck, index) => ({
            ...deck, reportDate, dateIndex, dailyRank: index + 1,
            rogueRating: getRogueRating(deck, index),
        })));
    }
    return { players: buildPlayerStandings(decks, endDate), window };
});
