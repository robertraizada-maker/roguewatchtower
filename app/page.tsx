import type { Metadata } from "next";

import DecksOfTheDay from "@/components/DecksOfTheDay";
import DateNavigator from "@/components/DateNavigator";
import { getAvailableDates } from "@/lib/api";
export const metadata: Metadata = {
    title: {
        absolute: "Pokémon TCG Rogue Decks | Daily Rogue Deck Rankings | Rogue Watchtower",
    },
    description:
        "Rogue Watchtower tracks the best Pokémon TCG rogue decks from tournaments around the world every day.",
};

function EmptyDecksOfTheDay({ message }: { message: string }) {
    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">
                Pokémon TCG Rogue Decks
            </h1>

            <p className="mt-3 text-slate-600">
                Rogue Watchtower tracks the best Pokémon TCG rogue decks from tournaments around the world every day. Discover the highest-performing rogue decks, Rogue Rankings and Decks of the Day.
            </p>

            <DateNavigator
                selectedDate=""
                availableDates={[]}
            />

            <p className="mt-4">
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
