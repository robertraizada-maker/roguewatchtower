export interface RogueRatingDeck {
    deck_name: string;
    meta_rank?: number;
    popularity_rank?: number;
    archetype_rank?: number;
    rogue_rating?: number;
}

export function getRogueRating(deck: RogueRatingDeck, index = 0) {
    if (typeof deck.rogue_rating === "number") {
        return Math.min(5, Math.max(1, Math.round(deck.rogue_rating)));
    }

    const popularityRank =
        deck.meta_rank ||
        deck.popularity_rank ||
        deck.archetype_rank ||
        (deck.deck_name === "Other" ? 91 : 51 + index);

    if (popularityRank <= 60) return 1;
    if (popularityRank <= 70) return 2;
    if (popularityRank <= 80) return 3;
    if (popularityRank <= 90) return 4;
    return 5;
}
export interface DeckAnchorDeck {
    tournament_id?: number;
    player_id?: number;
}

export function getDeckAnchorId(deck: DeckAnchorDeck, index = 0) {
    if (deck.tournament_id && deck.player_id) {
        return `deck-${deck.tournament_id}-${deck.player_id}`;
    }

    if (deck.player_id) {
        return `deck-${deck.player_id}`;
    }

    return `deck-${index + 1}`;
}