import type { Metadata } from "next";

import DecksOfTheDay from "@/components/DecksOfTheDay";
import DateNavigator from "@/components/DateNavigator";
import { getAvailableDates } from "@/lib/api";
export const metadata: Metadata = {
    title: {
        absolute: "Pokémon TCG Rogue Decks | Daily Rogue Deck Rankings | Rogue Watchtower",
    },
    description:
        "Discover the best Pokémon TCG rogue decks from tournaments worldwide.",
};

function EmptyDecksOfTheDay({ message }: { message: string }) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl font-bold sm:text-4xl">
                Pokémon TCG Rogue Decks
            </h1>

            <p className="mt-2 text-slate-600 sm:mt-3">
                Discover the best Pokémon TCG rogue decks from tournaments worldwide.
            </p>

            <DateNavigator
                selectedDate=""
                availableDates={[]}
            />

            <p className="mt-3 sm:mt-4">
                {message}
            </p>
        </div>
    );
}

export default async function Home() {
    let dates: string[] = [];
    let loadError = false;

    try {
        const availableDates = await getAvailableDates();
        dates = availableDates.dates;
    } catch {
        loadError = true;
    }

    if (loadError) {
        return <EmptyDecksOfTheDay message="Unable to load tournament data right now." />;
    }

    if (dates.length === 0) {
        return <EmptyDecksOfTheDay message="No tournament data available." />;
    }

    return (
        <DecksOfTheDay
            date={dates[0]}
            availableDates={dates}
        />
    );
}
