import DecksOfTheDay from "@/components/DecksOfTheDay";
import { getAvailableDates } from "@/lib/api";

export default async function Home() {
    const availableDates = await getAvailableDates();

    if (availableDates.dates.length === 0) {
        return (
            <div>
                <h1 className="text-4xl font-bold">
                    Rogue Decks of the Day
                </h1>

                <p className="mt-4">
                    No tournament data available.
                </p>
            </div>
        );
    }

    return (
        <DecksOfTheDay
            date={availableDates.dates[0]}
            availableDates={availableDates.dates}
        />
    );
}