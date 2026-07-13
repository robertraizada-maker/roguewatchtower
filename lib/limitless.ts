export function getLimitlessTournamentDetailsUrl(tournamentId?: number) {
    if (!tournamentId) {
        return null;
    }

    return `https://play.limitlesstcg.com/tournament/${tournamentId}/details`;
}

