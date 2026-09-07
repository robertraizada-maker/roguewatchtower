import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeckCard from "@/components/DeckCard";
import { getPlayers } from "@/lib/players";
import { formatPlayerDate, getPlayerMedal, PLAYER_POINTS } from "@/lib/player-standings";
import { getDeckDisplayName } from "@/lib/deck-display";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
    return (await getPlayers()).players.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const player = (await getPlayers()).players.find((entry) => entry.slug === slug);
    return {
        title: player ? `${player.name} – Player Profile` : "Player not found",
        description: player ? `${player.name}'s featured rogue decks and points over the last 28 days.` : undefined,
        alternates: { canonical: `/player/${slug}` },
    };
}

export default async function PlayerPage({ params }: Props) {
    const { slug } = await params;
    const { players, window } = await getPlayers();
    const player = players.find((entry) => entry.slug === slug);
    if (!player) notFound();
    return (
        <div className="space-y-6">
            <div>
                <Link href="/players" className="text-sm font-semibold text-emerald-800 hover:underline">← All players</Link>
                <h1 className="mt-3 break-words text-3xl font-bold sm:text-4xl">{player.name}</h1>
                <p className="mt-3 text-slate-600">Featured Decks of the Day appearances, newest first.</p>
                {window && <p className="mt-2 text-sm text-slate-500">{formatPlayerDate(window.startDate)} – {formatPlayerDate(window.endDate)} · Last 28 days</p>}
            </div>
            <dl className="grid grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <div><dt className="text-sm text-slate-500">Rank</dt><dd className="mt-1 text-2xl font-bold"><span aria-hidden="true">{getPlayerMedal(player.rank)} </span>{player.rank}</dd></div>
                <div><dt className="text-sm text-slate-500">Points</dt><dd className="mt-1 text-2xl font-bold">{player.points}</dd></div>
                <div><dt className="text-sm text-slate-500">Appearances</dt><dd className="mt-1 text-2xl font-bold">{player.decks.length}</dd></div>
            </dl>
            <h2 className="text-2xl font-bold">Featured decks</h2>
            <div className="space-y-5">
                {player.decks.map((deck, index) => (
                    <section key={`${deck.reportDate}-${deck.dailyRank}`} className="space-y-2" aria-label={`${formatPlayerDate(deck.reportDate)}, daily position ${deck.dailyRank}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <Link href={`/decks-of-the-day/${deck.reportDate}`} className="font-semibold text-emerald-800 hover:underline">{formatPlayerDate(deck.reportDate)} · View daily top five</Link>
                            <span className="text-slate-600">Daily position #{deck.dailyRank} · +{PLAYER_POINTS[deck.dailyRank - 1]} points</span>
                        </div>
                        <DeckCard
                            rank={deck.dailyRank} anchorId={`appearance-${index + 1}`}
                            archetype={getDeckDisplayName(deck.deck_name, deck.decklist_export)}
                            archetypeIcons={deck.deck_icons || deck.icon_urls || deck.archetype_icons}
                            player={deck.player_name}
                            tournamentId={deck.tournament_limitless_id ?? deck.tournament_id}
                            tournament={deck.tournament_name} standing={deck.standing}
                            players={deck.tournament_players} rogueRating={deck.rogueRating}
                            decklistExport={deck.decklist_export} reportDate={deck.reportDate}
                            highlightTopDeck={false}
                        />
                    </section>
                ))}
            </div>
        </div>
    );
}
