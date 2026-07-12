import { AvailableDatesResponse } from "@/types/rogue";

export async function fetchAvailableDates(): Promise<string[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
        return [];
    }

    const response = await fetch(`${baseUrl}/meta/available-dates`);

    if (!response.ok) {
        throw new Error("Failed to load available dates.");
    }

    const data: AvailableDatesResponse = await response.json();
    return data.dates ?? [];
}
