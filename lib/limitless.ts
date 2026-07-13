export function getLimitlessTournamentDetailsUrl(tournamentId?: string | number) {
    if (!tournamentId) {
        return null;
    }

    return `https://play.limitlesstcg.com/tournament/${tournamentId}/details`;
}

