import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getArchetypes } from "@/lib/archetypes";

export const metadata: Metadata = {
    title: "All Pokemon TCG Rogue Decks",
    description: "Browse Pokemon TCG rogue decks from the last 28 days by Rogue Rating.",
};

function getDeckCountLabel(count: number) {
    return count === 1 ? "1 deck" : `${count} decks`;
}

export default async function AllDecksPage() {
    const archetypes = await getArchetypes();
    const ratingGroups = [5, 4, 3, 2, 1]
        .map((rating) => ({
            rating,
            archetypes: archetypes
                .filter((archetype) => archetype.rogueRating === rating)
                .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((group) => group.archetypes.length > 0);

    return (
        <main className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">All Pokemon TCG Rogue Decks</h1>
                <p className="mt-2 max-w-3xl leading-7 text-slate-600 sm:mt-3">
                    Browse every Pokemon TCG rogue deck found in the last 28 days of tournament results.
                    Decks are grouped by Rogue Rating, then ordered alphabetically.
                </p>
            </div>

            <div className="space-y-8">
                {ratingGroups.map((group) => (
                    <section key={group.rating} className="space-y-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Rogue Rating {"\u2605".repeat(group.rating)}
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
        </main>
    );
}