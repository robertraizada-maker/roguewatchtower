"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getDeckDisplayName } from "@/lib/deck-display";
import { getLimitlessTournamentDetailsUrl } from "@/lib/limitless";
import { getDeckAnchorId } from "@/lib/rogue-rating";
import type { RankingDeck } from "@/lib/rogue-ranking";
import {
    getRankingRangeHref,
    RANKING_RANGE_OPTIONS,
} from "@/lib/ranking-ranges";
import type { RankingRange } from "@/lib/ranking-ranges";

type SortOption = "rogue-ranking" | "finish-percentage";

interface Props {
    decks: RankingDeck[];
    selectedRange: RankingRange;
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
}

function sortDecks(decks: RankingDeck[], sortOption: SortOption) {
    return [...decks].sort((a, b) => {
        if (sortOption === "finish-percentage") {
            if (a.finish_percentage !== b.finish_percentage) {
                return a.finish_percentage - b.finish_percentage;
            }

            if (b.rogueRating !== a.rogueRating) {
                return b.rogueRating - a.rogueRating;
            }

            return b.tournament_players - a.tournament_players;
        }

        if (b.rogueRating !== a.rogueRating) {
            return b.rogueRating - a.rogueRating;
        }

        if (a.finish_percentage !== b.finish_percentage) {
            return a.finish_percentage - b.finish_percentage;
        }

        return b.tournament_players - a.tournament_players;
    });
}

export default function RogueRankingTable({ decks, selectedRange }: Props) {
    const [sortOption, setSortOption] = useState<SortOption>("rogue-ranking");
    const rankedDecks = useMemo(
        () => sortDecks(
            decks.filter((deck) => deck.dateIndex < selectedRange),
            sortOption
        ),
        [decks, selectedRange, sortOption]
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <p className="text-sm font-bold text-slate-700">
                        Show results from
                    </p>

                    <nav
                        aria-label="Ranking result range"
                        className="flex flex-wrap items-center gap-3"
                    >
                        {RANKING_RANGE_OPTIONS.map((days) => (
                            <Link
                                key={days}
                                href={getRankingRangeHref(days)}
                                scroll={false}
                                aria-current={selectedRange === days ? "page" : undefined}
                                className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-semibold transition ${
                                    selectedRange === days
                                        ? "border-emerald-800 bg-emerald-50 text-emerald-950"
                                        : "border-slate-300 bg-white text-slate-700 hover:border-emerald-700"
                                }`}
                            >
                                Last {days} days
                            </Link>
                        ))}
                    </nav>
                </div>

                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 lg:justify-end">
                    Sort by
                    <select
                        value={sortOption}
                        onChange={(event) => setSortOption(event.target.value as SortOption)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                    >
                        <option value="rogue-ranking">Rogue Rating</option>
                        <option value="finish-percentage">Finish Percentage</option>
                    </select>
                </label>
            </div>

            <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                        <tr>
                            <th className="whitespace-nowrap px-4 py-3">Rank</th>
                            <th className="min-w-64 px-4 py-3">Deck</th>
                            <th className="whitespace-nowrap px-4 py-3">Rating</th>
                            <th className="whitespace-nowrap px-4 py-3">Finish</th>
                            <th className="whitespace-nowrap px-4 py-3">Players</th>
                            <th className="min-w-52 px-4 py-3">Player</th>
                            <th className="min-w-72 px-4 py-3">Tournament</th>
                            <th className="whitespace-nowrap px-4 py-3">Date</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {rankedDecks.map((deck, index) => (
                            <tr
                                key={`${deck.reportDate}-${deck.tournament_name}-${deck.player_name}-${deck.deck_name}`}
                                className="align-top hover:bg-emerald-50/50"
                            >
                                <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-700">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-4">
                                    <Link
                                        href={`/decks-of-the-day/${deck.reportDate}#${getDeckAnchorId(deck)}`}
                                        className="font-bold text-emerald-800 hover:underline"
                                    >
                                        {getDeckDisplayName(deck.deck_name, deck.decklist_export)}
                                    </Link>
                                    <div className="mt-1 text-xs text-slate-500">
                                        Daily rank #{deck.dailyRank}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                    <span
                                        aria-label={`${deck.rogueRating} out of 5 stars`}
                                        className="font-semibold text-amber-500"
                                    >
                                        {"\u2605".repeat(deck.rogueRating)}
                                        <span className="text-slate-300">
                                            {"\u2605".repeat(5 - deck.rogueRating)}
                                        </span>
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                                    {deck.finish_percentage.toFixed(2)}%
                                    <div className="mt-1 text-xs text-slate-500">
                                        {deck.standing} of {deck.tournament_players}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                                    {deck.tournament_players}
                                </td>
                                <td className="px-4 py-4 text-slate-700">
                                    {deck.player_name}
                                </td>
                                <td className="px-4 py-4 text-slate-700">
                                    {getLimitlessTournamentDetailsUrl(deck.tournament_limitless_id ?? deck.tournament_id) ? (
                                        <a
                                            href={getLimitlessTournamentDetailsUrl(deck.tournament_limitless_id ?? deck.tournament_id) ?? undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-emerald-800 hover:underline"
                                        >
                                            {deck.tournament_name}
                                        </a>
                                    ) : (
                                        deck.tournament_name
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                                    <Link
                                        href={`/decks-of-the-day/${deck.reportDate}#${getDeckAnchorId(deck)}`}
                                        className="text-emerald-800 hover:underline"
                                    >
                                        {formatDate(deck.reportDate)}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

