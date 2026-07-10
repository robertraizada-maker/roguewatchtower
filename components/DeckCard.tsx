interface DeckCardProps {
    rank: number;
    archetype: string;
    player: string;
    tournament: string;
    standing: number;
    players: number;
}

function getRankLabel(rank: number) {
    if (rank === 1) return "🥇 Rogue Deck of the Day";
    if (rank === 2) return "🥈 Runner-up";
    if (rank === 3) return "🥉 Third Place";
    return `${rank}.`;
}

export default function DeckCard({
    rank,
    archetype,
    player,
    tournament,
    standing,
    players,
}: DeckCardProps) {
    const finishPercent = ((standing / players) * 100).toFixed(1);

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-slate-700">
                {getRankLabel(rank)}
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-900">
                {archetype}
            </h2>

            <div className="mt-4 space-y-2 text-slate-700">
                <p>👤 {player}</p>
                <p>🏆 {standing}th of {players} players</p>
                <p>📊 Top {finishPercent}%</p>
                <p>🎮 {tournament}</p>
            </div>

            <button
                type="button"
                className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
                Copy decklist
            </button>
        </article>
    );
}