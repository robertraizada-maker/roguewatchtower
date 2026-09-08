import type { RankingDeck } from "@/lib/rogue-ranking";

export const PLAYER_POINTS = [8, 5, 3, 2, 1] as const;
export const PLAYER_WINDOW_DAYS = 28;

export interface PlayerStanding {
    id: number;
    slug: string;
    name: string;
    points: number;
    bestFinish: number;
    bestFinishPercentage: number;
    rank: number;
    wins: number;
    decks: RankingDeck[];
}

export function getPlayerSlug(id: number, handle?: string) {
    // Reserve the ID namespace so usernames cannot collide with fallback URLs.
    return handle && /^[a-z][a-z0-9_-]*$/i.test(handle) && !/^id-\d+$/i.test(handle)
        ? handle.toLowerCase() : `id-${id}`;
}

export function getPlayerWindow(endDate: string) {
    const start = new Date(`${endDate}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() - PLAYER_WINDOW_DAYS + 1);
    return { startDate: start.toISOString().slice(0, 10), endDate };
}

export function buildPlayerStandings(decks: RankingDeck[], endDate: string): PlayerStanding[] {
    const { startDate } = getPlayerWindow(endDate);
    const players = new Map<number, PlayerStanding>();
    const featured = decks.filter((deck) =>
        deck.reportDate >= startDate && deck.reportDate <= endDate &&
        Number.isInteger(deck.dailyRank) && deck.dailyRank >= 1 && deck.dailyRank <= 5
    ).sort((a, b) => b.reportDate.localeCompare(a.reportDate) || a.dailyRank - b.dailyRank);
    for (const deck of featured) {
        if (deck.player_id === undefined) throw new Error("A featured deck is missing its player ID.");
        let player = players.get(deck.player_id);
        if (!player) {
            player = {
                id: deck.player_id, slug: getPlayerSlug(deck.player_id, deck.player_handle),
                name: deck.player_name, points: 0, bestFinish: deck.dailyRank,
                bestFinishPercentage: (deck.standing / deck.tournament_players) * 100, rank: 0, wins: 0, decks: [],
            };
            players.set(player.id, player);
        }
        player.bestFinishPercentage = Math.min(player.bestFinishPercentage, (deck.standing / deck.tournament_players) * 100);
        player.points += PLAYER_POINTS[deck.dailyRank - 1];
        player.bestFinish = Math.min(player.bestFinish, deck.dailyRank);
        player.wins += Number(deck.dailyRank === 1);
        player.decks.push(deck);
    }
    const standings = [...players.values()].sort((a, b) =>
        b.points - a.points || a.bestFinishPercentage - b.bestFinishPercentage ||
        b.decks[0].reportDate.localeCompare(a.decks[0].reportDate) ||
        a.name.localeCompare(b.name) || a.id - b.id
    );
    const slugCounts = new Map<string, number>();
    for (const player of standings) slugCounts.set(player.slug, (slugCounts.get(player.slug) ?? 0) + 1);
    standings.forEach((player, index) => {
        if ((slugCounts.get(player.slug) ?? 0) > 1) player.slug = `id-${player.id}`;
        player.rank = index + 1;
    });
    return standings;
}

export function formatPlayerDate(date: string) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    });
}

export function getPlayerMedal(rank: number) {
    return ["🥇", "🥈", "🥉"][rank - 1] ?? null;
}
