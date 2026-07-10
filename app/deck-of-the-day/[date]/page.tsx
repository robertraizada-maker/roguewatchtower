import DecksOfTheDay from "@/components/DecksOfTheDay";
import { getAvailableDates } from "@/lib/api";

interface Props {
    params: Promise<{
        date: string;
    }>;
}

export default async function Page({ params }: Props) {
    const { date } = await params;

    const availableDates = await getAvailableDates();

    return (
        <DecksOfTheDay
            date={date}
            availableDates={availableDates.dates}
        />
    );
}