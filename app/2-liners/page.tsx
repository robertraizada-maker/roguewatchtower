import type { Metadata } from "next";
import Link from "next/link";
import DeckCard from "@/components/DeckCard";
import { getAvailableDates, getRogueDecks } from "@/lib/api";
import { getDeckDisplayName } from "@/lib/deck-display";
import { getDeckAnchorId, getRogueRating } from "@/lib/rogue-rating";
import { getUniqueCardCount } from "@/lib/two-liners";

export const metadata: Metadata = {
    title: "2-liners | Pokemon TCG Rogue Decks",
    description: "Daily top-five rogue decks with 16 unique cards or fewer, newest first.",
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
}

export default async function TwoLinersPage() {
    const { dates } = await getAvailableDates(true);
    const groups = [];
    // Keep requests bounded while including every available historical report.
    for (const date of [...new Set(dates)].sort().reverse()) {
        const { rogueDecks } = await getRogueDecks(date);
        const decks = rogueDecks.slice(0, 5).map((deck, index) => ({
            deck, index, uniqueCards: getUniqueCardCount(deck.decklist_export),
        })).filter(({ uniqueCards }) => uniqueCards !== null && uniqueCards <= 16);
        if (decks.length) groups.push({ date, decks });
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">2-liners</h1>
                <p className="mt-2 text-slate-600 sm:mt-3">
                    Decks that made the daily top five with 16 unique cards or fewer, newest first.
                </p>
            </div>
            {groups.length === 0 && <p>No qualifying decks found.</p>}
            {groups.map(({ date, decks }) => (
                <section key={date} aria-labelledby={`date-${date}`} className="space-y-4 sm:space-y-5">
                    <h2 id={`date-${date}`} className="text-xl font-semibold sm:text-2xl">
                        <Link href={`/decks-of-the-day/${date}`} className="text-emerald-800 hover:underline">
                            {formatDate(date)}
                        </Link>
                    </h2>
                    {decks.map(({ deck, index, uniqueCards }) => (
                        <div key={index} className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">{uniqueCards} unique cards</p>
                            <DeckCard
                                rank={index + 1}
                                anchorId={`${date}-${getDeckAnchorId(deck, index)}`}
                                archetype={getDeckDisplayName(deck.deck_name, deck.decklist_export)}
                                archetypeIcons={deck.deck_icons || deck.icon_urls || deck.archetype_icons}
                                player={deck.player_name}
                                tournamentId={deck.tournament_limitless_id ?? deck.tournament_id}
                                tournament={deck.tournament_name}
                                standing={deck.standing}
                                players={deck.tournament_players}
                                rogueRating={getRogueRating(deck, index)}
                                decklistExport={deck.decklist_export}
                            />
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
}
