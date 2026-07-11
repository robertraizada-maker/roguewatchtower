"use client";

import { useState } from "react";
interface DeckCardProps {
    rank: number;
    archetype: string;
    player: string;
    tournament: string;
    standing: number;
    players: number;
    decklistExport: string | null;
}

function getRankLabel(rank: number) {
    if (rank === 1) return "🥇 Rogue Deck of the Day";
    if (rank === 2) return "🥈 Runner-up";
    if (rank === 3) return "🥉 Third Place";
    return `${rank}.`;
}

function getOrdinal(value: number) {
    if (value % 100 >= 11 && value % 100 <= 13) {
        return `${value}th`;
    }

    switch (value % 10) {
        case 1:
            return `${value}st`;
        case 2:
            return `${value}nd`;
        case 3:
            return `${value}rd`;
        default:
            return `${value}th`;
    }
}

export default function DeckCard({
    rank,
    archetype,
    player,
    tournament,
    standing,
    players,
    decklistExport,
}: DeckCardProps) {
    const finishPercent = ((standing / players) * 100).toFixed(1);
    const isOutlawAward = rank === 1 && standing === 1 && players >= 32;

    const [copied, setCopied] = useState(false);

    async function copyDecklist() {
        if (!decklistExport) {
            return;
        }

        await navigator.clipboard.writeText(decklistExport);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <article
            className={`rounded-xl border p-6 shadow-sm ${
                rank === 1
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white"
            }`}
        >
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "1.5rem",
				}}
			>
				<div className="min-w-0">
					<div className="text-lg font-semibold text-slate-700">
						{getRankLabel(rank)}
					</div>

					{isOutlawAward && (
						<div
							className="mt-4 rounded-lg border p-4"
							style={{
								backgroundColor: "#f0fdf4",
								borderColor: "#14532d",
								borderWidth: "1px",
							}}
						>
							<div className="flex items-center gap-2">
								<span>🏹</span>

								<span
									className="text-sm font-bold tracking-wide"
									style={{
										textTransform: "uppercase",
									}}
								>
									Outlaw Award
								</span>
							</div>

							<div className="mt-1 text-sm italic">
								<em>Victory stolen from the meta</em>
							</div>
						</div>
					)}

					<h2 className="mt-4 text-2xl font-bold text-slate-900">
						{archetype}
					</h2>

					<div className="mt-4 space-y-2 text-slate-700">
						<p>👤 {player}</p>

						<p>
							🏆{" "}
							{isOutlawAward
								? `Won a ${players}-player tournament`
								: `${getOrdinal(standing)} of ${players} players`}
						</p>

						<p>📊 Top {finishPercent}%</p>

						<p>🎮 {tournament}</p>
					</div>
				</div>

				<div
					className="min-w-0 pl-6"
					style={{
						borderLeft: "1px solid #cbd5e1",
                        paddingLeft: "1.5rem",
					}}
				>
					

					{decklistExport ? (
						<pre
							className="overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-800"
							style={{
								fontFamily: "Consolas, 'Courier New', monospace",
							}}
						>
							{decklistExport}
						</pre>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							Decklist unavailable.
						</p>
					)}

					<div className="flex justify-end"
						style={{
							marginTop: "1rem",
						}}
					>
						{decklistExport && (
							<button
								type="button"
								onClick={copyDecklist}
								className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50"
							>
								{copied ? "Copied!" : "Copy to Clipboard"}
							</button>
						)}
					</div>
				</div>
			</div>
        </article>
    );
}