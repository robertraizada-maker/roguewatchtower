import DecksOfTheDay from "@/components/DecksOfTheDay";
import DateNavigator from "@/components/DateNavigator";
import { getAvailableDates } from "@/lib/api";

export default async function Home() {
    try {
        const availableDates = await getAvailableDates();

        if (availableDates.dates.length === 0) {
            return (
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold">
                        Rogue Decks of the Day
                    </h1>

                    <DateNavigator
                        selectedDate=""
                        availableDates={[]}
                    />

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
    } catch {
        return (
            <div className="space-y-6">
                <h1 className="text-4xl font-bold">
                    Rogue Decks of the Day
                </h1>

                <DateNavigator
                    selectedDate=""
                    availableDates={[]}
                />

                <p className="mt-4">
                    Unable to load tournament data right now.
                </p>
            </div>
        );
    }
}