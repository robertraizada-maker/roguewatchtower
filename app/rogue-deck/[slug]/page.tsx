import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DeckCard from "@/components/DeckCard";
import { getArchetypeBySlug, getArchetypes } from "@/lib/archetypes";
import { getDeckAnchorId } from "@/lib/rogue-rating";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const archetypes = await getArchetypes();

    return archetypes.map((archetype) => ({
        slug: archetype.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const archetype = await getArchetypeBySlug(slug);

    if (!archetype) {
        return {
            title: "Rogue Deck",
        };
    }

    return {
        title: `${archetype.name} Rogue Decks`,
        description: `Recent Pokemon TCG rogue deck results for ${archetype.name}.`,
        alternates: {
            canonical: `/rogue-deck/${archetype.slug}`,
        },
    };
}

export default async function RogueDeckPage({ params }: Props) {
    const { slug } = await params;
    const archetype = await getArchetypeBySlug(slug);

    if (!archetype) {
        notFound();
    }

    const decks = [...archetype.decks].sort((a, b) => {
        if (a.finish_percentage !== b.finish_percentage) {
            return a.finish_percentage - b.finish_percentage;
        }

        if (b.rogueRating !== a.rogueRating) {
            return b.rogueRating - a.rogueRating;
        }

        return b.tournament_players - a.tournament_players;
    });

    return (
        <main className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                    {archetype.name} Rogue Decks
                </h1>
                <p className="mt-2 text-slate-600 sm:mt-3">
                    All {archetype.deckCount} recent rogue deck result{archetype.deckCount === 1 ? "" : "s"} for this deck from the last 28 days, ordered by finish percentage.
                </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
                {decks.map((deck, index) => (
                    <DeckCard
                        key={`${deck.reportDate}-${deck.tournament_name}-${deck.player_name}-${deck.deck_name}`}
                        rank={index + 1}
                        anchorId={getDeckAnchorId(deck)}
                        archetype={deck.deck_name}
                        archetypeIcons={
                            deck.deck_icons ||
                            deck.icon_urls ||
                            deck.archetype_icons
                        }
                        player={deck.player_name}
                        tournamentId={deck.tournament_limitless_id ?? deck.tournament_id}
                        tournament={deck.tournament_name}
                        standing={deck.standing}
                        players={deck.tournament_players}
                        rogueRating={deck.rogueRating}
                        decklistExport={deck.decklist_export}
                        reportDate={deck.reportDate}
                    />
                ))}
            </div>
        </main>
    );
}