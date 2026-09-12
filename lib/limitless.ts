export function getLimitlessTournamentStandingsUrl(tournamentId?: string | number) {
    if (!tournamentId) {
        return null;
    }

    return `https://play.limitlesstcg.com/tournament/${tournamentId}/standings`;
}

