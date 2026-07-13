import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getArchetypes } from "@/lib/archetypes";

export const metadata: Metadata = {
    title: "Archetypes",
    description: "Browse Pokemon TCG rogue archetypes from the last 28 days by Rogue Rating.",
};

function getDeckCountLabel(count: number) {
    return count === 1 ? "1 deck" : `${count} decks`;
}

export default async function ArchetypesPage() {
    const archetypes = await getArchetypes();

    return (
        <main className="space-y-5">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">Archetypes</h1>
                <p className="mt-2 max-w-3xl leading-7 text-slate-600 sm:mt-3">
                    Browse every rogue archetype found in the last 28 days of tournament results.
                    Ordered by Rogue Rating first, then alphabetically.
                </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {archetypes.map((archetype) => (
                    <li key={archetype.slug}>
                        <Link
                            href={`/archtypes/${archetype.slug}`}
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
                                    Rogue Rating {"\u2605".repeat(archetype.rogueRating)}{"\u2606".repeat(5 - archetype.rogueRating)} - {getDeckCountLabel(archetype.deckCount)}
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
