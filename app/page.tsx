import DecksOfTheDay from "@/components/DecksOfTheDay";
import DateNavigator from "@/components/DateNavigator";
import { getAvailableDates } from "@/lib/api";

function EmptyDecksOfTheDay({ message }: { message: string }) {
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
