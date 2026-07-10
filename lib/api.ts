import {
    AvailableDatesResponse,
    RogueDeckResponse,
} from "@/types/rogue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getRogueDecks(
    date: string
): Promise<RogueDeckResponse> {
    const response = await fetch(
        `${API_BASE_URL}/meta/rogue?date=${date}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load rogue decks.");
    }

    return response.json();
}

export async function getAvailableDates(): Promise<AvailableDatesResponse> {
    const response = await fetch(
        `${API_BASE_URL}/meta/available-dates`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load available dates.");
    }

    return response.json();
}