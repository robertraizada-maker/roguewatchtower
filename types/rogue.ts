export interface RogueDeck {
    tournament_id?: number;
    player_id?: number;
    deck_name: string;
    deck_icons?: string[];
    icon_urls?: string[];
    archetype_icons?: string[];
    meta_rank?: number;
    popularity_rank?: number;
    archetype_rank?: number;
    rogue_rating?: number;
    player_name: string;
    tournament_name: string;
    tournament_players: number;
    standing: number;
    wins: number;
    losses: number;
    ties: number;
    rounds_played: number;
    finish_percentage: number;
    decklist_export: string | null;
}

export interface RogueDeckResponse {
    success: boolean;
    reportDate: string;
    rogueDecks: RogueDeck[];
}

export interface AvailableDatesResponse {
    success: boolean;
    dates: string[];
}