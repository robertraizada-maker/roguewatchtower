"use client";

import Image from "next/image";
import { useState } from "react";

import { getArchetypeIconUrls } from "@/lib/archetype-icons";
import { getDeckDisplayName } from "@/lib/deck-display";
import { getLimitlessTournamentDetailsUrl } from "@/lib/limitless";

interface DeckCardProps {
    rank: number;
    anchorId: string;
    archetype: string;
    archetypeIcons?: string[];
    player: string;
    tournamentId?: string | number;
    tournament: string;
    standing: number;
    players: number;
    rogueRating: number;
    decklistExport: string | null;
    reportDate?: string;
    showRogueRating?: boolean;
}

function getRankLabel(rank: number) {
    if (rank === 1) return "\uD83E\uDD47 Rogue Deck of the Day";
    if (rank === 2) return "\uD83E\uDD48 Runner-up";
    if (rank === 3) return "\uD83E\uDD49 Third Place";
    return `${rank}.`;
}

function formatCompetitionDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
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
    anchorId,
    archetype,
    archetypeIcons,
    player,
    tournamentId,
    tournament,
    standing,
    players,
    rogueRating,
    decklistExport,
    reportDate,
    showRogueRating = true,
}: DeckCardProps) {
    const finishPercent = ((standing / players) * 100).toFixed(1);
    const isOutlawAward = rank === 1 && standing === 1 && players >= 32;
    const displayArchetype = getDeckDisplayName(archetype, decklistExport);
    const tournamentUrl = getLimitlessTournamentDetailsUrl(tournamentId);
    const iconUrls =
        getArchetypeIconUrls(displayArchetype, archetypeIcons);

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

    function openDeckImage() {
        if (!decklistExport) {
            return;
        }

        window.localStorage.setItem(
            "roguewatchtower:view-as-image",
            JSON.stringify({
                archetype: displayArchetype,
                player,
    tournamentId,
                tournament,
                decklist: decklistExport,
            })
        );

        window.open("/view-as-image", "_blank", "noopener,noreferrer");
    }

    return (
        <article
            id={anchorId}
            className={`rounded-xl border p-6 shadow-sm ${
                rank === 1
                    ? "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white"
            }`}
        >
            <div className="grid gap-6 md:grid-cols-2">
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
                                <span>{"\uD83C\uDFF9"}</span>

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

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex shrink-0 items-center gap-1">
                            {iconUrls.map((iconUrl) => (
                                <Image
                                    key={iconUrl}
                                    src={iconUrl}
                                    alt=""
                                    aria-hidden="true"
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 object-contain"
                                    unoptimized
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            ))}
                        </div>

                        <h2 className="min-w-0 text-2xl font-bold text-slate-900">
                            {displayArchetype}
                        </h2>
                    </div>

                    {showRogueRating && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-emerald-800 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950">
                            <span>Rogue Rating</span>

                            <span
                                aria-label={`${rogueRating} out of 5 stars`}
                                className="tracking-wide text-amber-500"
                            >
                                {"\u2605".repeat(rogueRating)}
                                <span className="text-slate-300">
                                    {"\u2605".repeat(5 - rogueRating)}
                                </span>
                            </span>
                        </div>
                    )}

                    <div className="mt-4 space-y-2 text-slate-700">
                        <p>{player}</p>

                        {reportDate && (
                            <p>Competition date: {formatCompetitionDate(reportDate)}</p>
                        )}

                        <p>{isOutlawAward
                                ? `Won a ${players}-player tournament`
                                : `${getOrdinal(standing)} of ${players} players`}
                        </p>

                        <p>Top {finishPercent}%</p>

                        <p>
                            {tournamentUrl ? (
                                <a
                                    href={tournamentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-emerald-800 hover:underline"
                                >
                                    {tournament}
                                </a>
                            ) : (
                                tournament
                            )}
                        </p>
                    </div>
                </div>

                <div className="min-w-0 border-t border-slate-300 pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
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
                        <p className="text-sm text-slate-500">
                            Decklist unavailable.
                        </p>
                    )}

                    <div
                        className="flex flex-wrap justify-end gap-3"
                        style={{
                            marginTop: "1rem",
                        }}
                    >
                        {decklistExport && (
                            <>
                                <button
                                    type="button"
                                    onClick={openDeckImage}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
                                >
                                    Open as Image
                                </button>

                                <button
                                    type="button"
                                    onClick={copyDecklist}
                                    className="rounded-lg border border-green-900 bg-green-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-950"
                                >
                                    {copied ? "Copied!" : "Copy to Clipboard"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

