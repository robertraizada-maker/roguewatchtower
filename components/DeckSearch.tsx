"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { getDeckDisplayName } from "@/lib/deck-display";
import { getLimitlessTournamentDetailsUrl } from "@/lib/limitless";
import {
    defaultOtherDeckTypes,
    OTHER_DECK_TYPES_STORAGE_KEY,
    parseOtherDeckTypeCriteria,
    type OtherDeckType,
} from "@/lib/other-deck-types";
import { getDeckAnchorId } from "@/lib/rogue-rating";
import { RogueDeck } from "@/types/rogue";

export type SearchableDeck = RogueDeck & {
    reportDate: string;
    dailyRank: number;
    rogueRating: number;
};

interface Props {
    decks: SearchableDeck[];
}

interface SearchResult {
    deck: SearchableDeck;
    matches: string[];
}

interface StoredOtherDeckType {
    archetype: string;
    criteriaText: string;
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
}

function getPokemonLines(decklist: string | null) {
    if (!decklist) {
        return [];
    }

    const lines = decklist.split(/\r?\n/);
    const pokemonLines: string[] = [];
    let inPokemonSection = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            continue;
        }

        const sectionMatch = line.match(/^([^:]+):/);

        if (sectionMatch) {
            const sectionName = sectionMatch[1].toLowerCase();
            inPokemonSection = sectionName.startsWith("pok");
            continue;
        }

        if (inPokemonSection) {
            pokemonLines.push(line);
        }
    }

    return pokemonLines;
}

function getPokemonName(line: string) {
    const match = line.match(/^\d+\s+(.+)\s+[A-Z0-9]{2,8}\s+[A-Z]*\d+[a-z]?(?:\/\d+)?$/i);
    return match?.[1] ?? line;
}

function getAvailablePokemon(decks: SearchableDeck[]) {
    return Array.from(
        new Set(
            decks.flatMap((deck) =>
                getPokemonLines(deck.decklist_export).map(getPokemonName)
            )
        )
    ).sort((a, b) => a.localeCompare(b));
}

function parseStoredOtherDeckTypes(storedValue: string | null) {
    if (!storedValue) {
        return undefined;
    }

    try {
        const storedDeckTypes = JSON.parse(storedValue) as StoredOtherDeckType[];

        if (!Array.isArray(storedDeckTypes)) {
            return undefined;
        }

        const otherDeckTypes = storedDeckTypes
            .map((deckType): OtherDeckType | null => {
                const archetype = deckType.archetype?.trim();
                const criteria = parseOtherDeckTypeCriteria(deckType.criteriaText ?? "");

                if (!archetype || criteria.length === 0) {
                    return null;
                }

                return {
                    archetype,
                    criteria,
                };
            })
            .filter((deckType): deckType is OtherDeckType => deckType !== null);

        return otherDeckTypes.length > 0
            ? [...defaultOtherDeckTypes, ...otherDeckTypes]
            : undefined;
    } catch {
        return undefined;
    }
}

function subscribeToStoredOtherDeckTypes(onStoreChange: () => void) {
    window.addEventListener("storage", onStoreChange);

    return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredOtherDeckTypesSnapshot() {
    return window.localStorage.getItem(OTHER_DECK_TYPES_STORAGE_KEY);
}

function searchDecks(decks: SearchableDeck[], query: string): SearchResult[] {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
        return [];
    }

    return decks
        .map((deck) => ({
            deck,
            matches: getPokemonLines(deck.decklist_export).filter((line) =>
                getPokemonName(line).toLowerCase().includes(normalizedQuery)
            ),
        }))
        .filter((result) => result.matches.length > 0)
        .sort((a, b) => {
            if (b.deck.rogueRating !== a.deck.rogueRating) {
                return b.deck.rogueRating - a.deck.rogueRating;
            }

            if (a.deck.finish_percentage !== b.deck.finish_percentage) {
                return a.deck.finish_percentage - b.deck.finish_percentage;
            }

            return b.deck.tournament_players - a.deck.tournament_players;
        });
}

export default function DeckSearch({ decks }: Props) {
    const [query, setQuery] = useState("");
    const [selectedPokemon, setSelectedPokemon] = useState("");
    const storedOtherDeckTypesSnapshot = useSyncExternalStore(
        subscribeToStoredOtherDeckTypes,
        getStoredOtherDeckTypesSnapshot,
        () => null
    );
    const storedOtherDeckTypes = useMemo(
        () => parseStoredOtherDeckTypes(storedOtherDeckTypesSnapshot),
        [storedOtherDeckTypesSnapshot]
    );
    const availablePokemon = useMemo(() => getAvailablePokemon(decks), [decks]);
    const activeQuery = selectedPokemon || query;
    const results = useMemo(() => searchDecks(decks, activeQuery), [decks, activeQuery]);
    const hasSearch = activeQuery.trim().length >= 2;

    return (
        <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <label className="flex flex-col gap-2 text-sm font-bold text-slate-700">
                        Pokemon name
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setSelectedPokemon("");
                            }}
                            className="min-w-0 rounded-md border border-slate-300 px-3 py-2 text-base font-medium text-slate-900 shadow-sm focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                            placeholder="Delibird, Incineroar, Gengar..."
                            autoComplete="off"
                        />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-bold text-slate-700 lg:min-w-80">
                        Or choose a Pokemon found in a rogue deck
                        <select
                            value={selectedPokemon}
                            onChange={(event) => {
                                setSelectedPokemon(event.target.value);
                                setQuery("");
                            }}
                            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-medium text-slate-900 shadow-sm focus:border-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                        >
                            <option value="">Select a Pokemon</option>
                            {availablePokemon.map((pokemon) => (
                                <option key={pokemon} value={pokemon}>
                                    {pokemon}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {hasSearch && (
                <p className="text-sm text-slate-600">
                    {results.length === 1
                        ? "1 deck found"
                        : `${results.length} decks found`}
                </p>
            )}

            <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                        <tr>
                            <th className="min-w-64 px-4 py-3">Deck</th>
                            <th className="min-w-60 px-4 py-3">Matched Pokemon</th>
                            <th className="whitespace-nowrap px-4 py-3">Rating</th>
                            <th className="min-w-52 px-4 py-3">Player</th>
                            <th className="min-w-72 px-4 py-3">Tournament</th>
                            <th className="whitespace-nowrap px-4 py-3">Finish</th>
                            <th className="whitespace-nowrap px-4 py-3">Date</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {results.map(({ deck, matches }) => (
                            <tr
                                key={`${deck.reportDate}-${deck.tournament_name}-${deck.player_name}-${deck.deck_name}`}
                                className="align-top hover:bg-emerald-50/50"
                            >
                                <td className="px-4 py-4">
                                    <Link
                                        href={`/decks-of-the-day/${deck.reportDate}#${getDeckAnchorId(deck)}`}
                                        className="font-bold text-emerald-800 hover:underline"
                                    >
                                        {getDeckDisplayName(
                                            deck.deck_name,
                                            deck.decklist_export,
                                            storedOtherDeckTypes
                                        )}
                                    </Link>
                                    <div className="mt-1 text-xs text-slate-500">
                                        Daily rank #{deck.dailyRank}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-slate-700">
                                    <ul className="space-y-1">
                                        {matches.map((match) => (
                                            <li key={match}>{match}</li>
                                        ))}
                                    </ul>
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
                                    {deck.finish_percentage.toFixed(2)}%
                                    <div className="mt-1 text-xs text-slate-500">
                                        {deck.standing} of {deck.tournament_players}
                                    </div>
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

                        {!hasSearch && (
                            <tr>
                                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                                    Enter a Pokemon name, or choose one from the list, to search recent rogue decklists.
                                </td>
                            </tr>
                        )}

                        {hasSearch && results.length === 0 && (
                            <tr>
                                <td className="px-4 py-6 text-slate-500" colSpan={7}>
                                    No matching rogue decks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
