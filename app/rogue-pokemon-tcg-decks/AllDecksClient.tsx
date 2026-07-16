"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import { getArchetypeIconUrls, slugifyPokemonName } from "@/lib/archetype-icons";
import { getDeckDisplayName } from "@/lib/deck-display";
import {
    ICON_KEYWORDS_STORAGE_KEY,
    parseIgnoredIconKeywords,
} from "@/lib/icon-keywords";

import type { RankingDeck } from "@/lib/rogue-ranking";

interface Props {
    decks: RankingDeck[];
}

interface ArchetypeSummary {
    name: string;
    slug: string;
    rogueRating: number;
    deckCount: number;
    iconUrls: string[];
}

function getDeckCountLabel(count: number) {
    return count === 1 ? "1 deck" : `${count} decks`;
}

function subscribeToStoredIconKeywords(onStoreChange: () => void) {
    window.addEventListener("storage", onStoreChange);

    return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredIconKeywordsSnapshot() {
    return window.localStorage.getItem(ICON_KEYWORDS_STORAGE_KEY);
}

function getArchetypes(
    decks: RankingDeck[],
    ignoredIconKeywords: string[]
): ArchetypeSummary[] {
    const grouped = new Map<string, RankingDeck[]>();

    decks.forEach((deck) => {
        const name = getDeckDisplayName(deck.deck_name, deck.decklist_export);
        grouped.set(name, [...(grouped.get(name) || []), deck]);
    });

    return Array.from(grouped.entries())
        .map(([name, archetypeDecks]) => {
            const bestDeck = [...archetypeDecks].sort((a, b) => {
                if (b.rogueRating !== a.rogueRating) {
                    return b.rogueRating - a.rogueRating;
                }

                if (a.finish_percentage !== b.finish_percentage) {
                    return a.finish_percentage - b.finish_percentage;
                }

                return b.tournament_players - a.tournament_players;
            })[0];

            return {
                name,
                slug: slugifyPokemonName(name),
                rogueRating: bestDeck?.rogueRating ?? 0,
                deckCount: archetypeDecks.length,
                iconUrls: getArchetypeIconUrls(name, undefined, ignoredIconKeywords),
            };
        })
        .sort((a, b) => {
            if (b.rogueRating !== a.rogueRating) {
                return b.rogueRating - a.rogueRating;
            }

            return a.name.localeCompare(b.name);
        });
}

export default function AllDecksClient({ decks }: Props) {
    const storedIconKeywordsSnapshot = useSyncExternalStore(
        subscribeToStoredIconKeywords,
        getStoredIconKeywordsSnapshot,
        () => null
    );
    const ignoredIconKeywords = useMemo(
        () => parseIgnoredIconKeywords(storedIconKeywordsSnapshot),
        [storedIconKeywordsSnapshot]
    );
    const archetypes = useMemo(
        () => getArchetypes(decks, ignoredIconKeywords),
        [decks, ignoredIconKeywords]
    );
    const ratingGroups = [5, 4, 3, 2, 1]
        .map((rating) => ({
            rating,
            archetypes: archetypes
                .filter((archetype) => archetype.rogueRating === rating)
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((group) => group.archetypes.length > 0);

    return (
        <div className="space-y-8">
            {ratingGroups.map((group) => (
                <section key={group.rating} className="space-y-3">
                    <h2 className="text-2xl font-bold text-slate-900">
                        <Link
                            href="/rogue-rating"
                            title="Learn how Rogue Rating works"
                            className="cursor-pointer text-slate-900 hover:text-emerald-800 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:ring-offset-2"
                        >
                            Rogue Rating {"\u2605".repeat(group.rating)}
                        </Link>
                    </h2>

                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.archetypes.map((archetype) => (
                            <li key={archetype.slug}>
                                <Link
                                    href={`/rogue-deck/${archetype.slug}`}
                                    className="flex h-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-700 hover:bg-emerald-50/50"
                                >
                                    <span className="flex shrink-0 items-center gap-1">
                                        {archetype.iconUrls.map((iconUrl) => (
                                            <Image
                                                key={iconUrl}
                                                src={iconUrl}
                                                alt=""
                                                aria-hidden="true"
                                                width={36}
                                                height={36}
                                                className="h-9 w-9 object-contain"
                                                unoptimized
                                            />
                                        ))}
                                    </span>

                                    <span className="min-w-0">
                                        <span className="block font-bold text-emerald-900">
                                            {archetype.name}
                                        </span>
                                        <span className="mt-1 block text-sm text-slate-600">
                                            {getDeckCountLabel(archetype.deckCount)}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
