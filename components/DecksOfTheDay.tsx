import DeckCard from "@/components/DeckCard";
import DateNavigator from "@/components/DateNavigator";
import { getRogueDecks } from "@/lib/api";
import { getDeckAnchorId, getRogueRating } from "@/lib/rogue-rating";

interface Props {
    date: string;
    availableDates: string[];
}

export default async function DecksOfTheDay({ date, availableDates }: Props) {
    const result = await getRogueDecks(date);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold">
                    Rogue Decks of the Day
                </h1>

                <p className="mt-3 text-slate-600">
                    The best rogue Pokémon TCG decks from recent Standard tournaments.
                </p>
            </div>

            <DateNavigator
                selectedDate={date}
                availableDates={availableDates}
            />

            <div className="space-y-5">
                {result.rogueDecks.map((deck, index) => (
                    <DeckCard
                        key={index}
                        rank={index + 1}
                        anchorId={getDeckAnchorId(deck, index)}
                        archetype={deck.deck_name}
                        archetypeIcons={
                            deck.deck_icons ||
                            deck.icon_urls ||
                            deck.archetype_icons
                        }
                        player={deck.player_name}
                        tournament={deck.tournament_name}
                        standing={deck.standing}
                        players={deck.tournament_players}
                        rogueRating={getRogueRating(deck, index)}
                        decklistExport={deck.decklist_export}
                    />
                ))}
            </div>
        </div>
    );
}