import type { Metadata } from "next";
import DecksOfTheDay from "@/components/DecksOfTheDay";
import { getAvailableDates } from "@/lib/api";

interface Props {
    params: Promise<{
        date: string;
    }>;
}

function formatDateForTitle(date: string) {
    return new Date(date + "T00:00:00Z").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

export async function generateStaticParams() {
    const result = await getAvailableDates();

    if (result.dates.length === 0) {
        throw new Error(
            "No available dates returned from API during build."
        );
    }

    return result.dates.map((date) => ({
        date,
    }));
}

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const { date } = await params;
    const formattedDate = formatDateForTitle(date);

    return {
        title: `Rogue Decks of the Day - ${formattedDate}`,
        description:
            `The best rogue Pokemon TCG decks from Standard tournaments on ${formattedDate}.`,
        alternates: {
            canonical: `/decks-of-the-day/${date}`,
        },
    };
}

export default async function Page({ params }: Props) {
    const { date } = await params;

    let availableDates: string[] = [];

    try {
        const result = await getAvailableDates();
        availableDates = result.dates;
    } catch {
        availableDates = [];
    }

    return (
        <DecksOfTheDay
            date={date}
            availableDates={availableDates}
        />
    );
}
