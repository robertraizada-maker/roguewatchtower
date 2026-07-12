import {
    AvailableDatesResponse,
    RogueDeckResponse,
} from "@/types/rogue";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BUILD_CACHE_KEY =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.CF_PAGES_DEPLOYMENT_ID ||
    Date.now().toString();

if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
}

export async function getRogueDecks(
    date: string
): Promise<RogueDeckResponse> {
    const params = new URLSearchParams({
        date,
        build: BUILD_CACHE_KEY,
    });

    const response = await fetch(
        `${API_BASE_URL}/meta/rogue?${params.toString()}`,
        {
            cache: "force-cache",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load rogue decks.");
    }

    return response.json();
}

export async function getAvailableDates(): Promise<AvailableDatesResponse> {
    const response = await fetch(
        `${API_BASE_URL}/meta/available-dates?build=${BUILD_CACHE_KEY}`,
        {
            cache: "force-cache",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load available dates.");
    }

    return response.json();
}