export interface RogueDeck {
    deck_name: string;
    player_name: string;
    tournament_name: string;
    tournament_players: number;
    standing: number;
    wins: number;
    losses: number;
    ties: number;
    rounds_played: number;
    finish_percentage: number;
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