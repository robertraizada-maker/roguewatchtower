import { getArchetypeIconUrls, slugifyPokemonName } from "@/lib/archetype-icons";
import { getDeckDisplayName } from "@/lib/deck-display";
import { getRankingDecks, type RankingDeck } from "@/lib/rogue-ranking";

export interface ArchetypeSummary {
    name: string;
    slug: string;
    rogueRating: number;
    deckCount: number;
    iconUrls: string[];
    decks: RankingDeck[];
}

export function getArchetypeSlug(name: string) {
    return slugifyPokemonName(name);
}


export async function getArchetypes(): Promise<ArchetypeSummary[]> {
    const decks = await getRankingDecks();
    const grouped = new Map<string, RankingDeck[]>();

    decks.forEach((deck) => {
        const name = getDeckDisplayName(deck.deck_name, deck.decklist_export);
        grouped.set(name, [...(grouped.get(name) || []), deck]);
    });

    return Array.from(grouped.entries())
        .map(([name, archetypeDecks]) => {
            const sortedDecks = [...archetypeDecks].sort((a, b) => {
                if (a.dateIndex !== b.dateIndex) {
                    return a.dateIndex - b.dateIndex;
                }

                return a.dailyRank - b.dailyRank;
            });
            const bestDeck = [...sortedDecks].sort((a, b) => {
                if (b.rogueRating !== a.rogueRating) {
                    return b.rogueRating - a.rogueRating;
                }

                if (a.finish_percentage !== b.finish_percentage) {
                    return a.finish_percentage - b.finish_percentage;
                }

                return b.tournament_players - a.tournament_players;
            })[0];

            return {
                name,
                slug: getArchetypeSlug(name),
                rogueRating: bestDeck?.rogueRating ?? 0,
                deckCount: sortedDecks.length,
                iconUrls: getArchetypeIconUrls(name),
                decks: sortedDecks,
            };
        })
        .sort((a, b) => {
            if (b.rogueRating !== a.rogueRating) {
                return b.rogueRating - a.rogueRating;
            }

            return a.name.localeCompare(b.name);
        });
}

export async function getArchetypeBySlug(slug: string) {
    const archetypes = await getArchetypes();

    return archetypes.find((archetype) => archetype.slug === slug) ?? null;
}
