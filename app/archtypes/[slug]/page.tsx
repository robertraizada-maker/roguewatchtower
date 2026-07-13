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
            title: "Archetype",
        };
    }

    return {
        title: `${archetype.name} Rogue Decks`,
        description: `Recent Pokemon TCG rogue deck results for ${archetype.name}.`,
        alternates: {
            canonical: `/archtypes/${archetype.slug}`,
        },
    };
}

export default async function ArchetypePage({ params }: Props) {
    const { slug } = await params;
    const archetype = await getArchetypeBySlug(slug);

    if (!archetype) {
        notFound();
    }

    return (
        <main className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                    {archetype.name} Rogue Decks
                </h1>
                <p className="mt-2 text-slate-600 sm:mt-3">
                    All {archetype.deckCount} recent rogue deck result{archetype.deckCount === 1 ? "" : "s"} for this archetype from the last 28 days.
                </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
                {archetype.decks.map((deck) => (
                    <DeckCard
                        key={`${deck.reportDate}-${deck.tournament_name}-${deck.player_name}-${deck.deck_name}`}
                        rank={deck.dailyRank}
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
                    />
                ))}
            </div>
        </main>
    );
}
