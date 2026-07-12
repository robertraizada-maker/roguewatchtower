import type { Metadata } from "next";
import Link from "next/link";
import { getAvailableDates, getRogueDecks } from "@/lib/api";
import { filterAccurateReportDates } from "@/lib/accurate-dates";

export const metadata: Metadata = {
    title: "Sitemap",
    description: "Browse Rogue Watchtower pages and recent decks of the day.",
};

function formatDate(date: string) {
    return new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

export default async function SitemapPage() {
    const result = await getAvailableDates();
    const accurateDates = filterAccurateReportDates(result.dates);
    const deckLinks = await Promise.all(
        accurateDates.map(async (date) => {
            const decks = await getRogueDecks(date);
            const topDeck = decks.rogueDecks[0];

            return {
                date,
                archetype: topDeck?.deck_name ?? "No rogue deck found",
                player: topDeck?.player_name ?? "Unknown player",
            };
        })
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Sitemap</h1>
                <p className="mt-3 text-slate-600">
                    Browse the main pages and recent rogue decks of the day.
                </p>
            </div>

            <section className="space-y-3">
                <h2 className="text-2xl font-semibold">Main Pages</h2>
                <ul className="space-y-2 text-slate-700">
                    <li>
                        <Link className="font-medium text-emerald-800 hover:underline" href="/">
                            Decks of the Day
                        </Link>
                    </li>
                    <li>
                        <Link className="font-medium text-emerald-800 hover:underline" href="/about">
                            About
                        </Link>
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-2xl font-semibold">Recent Decks of the Day</h2>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {deckLinks.map((deckLink) => (
                        <li key={deckLink.date}>
                            <Link
                                className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-emerald-800 hover:border-emerald-700 hover:underline"
                                href={`/decks-of-the-day/${deckLink.date}`}
                            >
                                <span className="block font-semibold">
                                    {formatDate(deckLink.date)}
                                </span>
                                <span className="mt-1 block font-medium text-slate-900">
                                    {deckLink.archetype}
                                </span>
                                <span className="mt-1 block text-sm text-slate-600">
                                    {deckLink.player}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}