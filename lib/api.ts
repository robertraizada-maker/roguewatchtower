import {
    AvailableDatesResponse,
    RogueDeck,
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

function hasDecklist(deck: RogueDeck) {
    return Boolean(deck.decklist_export?.trim());
}

function getLimitlessDecklistUrl(deck: RogueDeck) {
    if (!deck.tournament_limitless_id || !deck.player_name) {
        return null;
    }

    return `https://play.limitlesstcg.com/tournament/${deck.tournament_limitless_id}/player/${encodeURIComponent(deck.player_name)}/decklist`;
}

function extractLimitlessDecklist(html: string) {
    const match = html.match(/const decklist = `([\s\S]*?)`/);
    return match?.[1]?.trim() || null;
}

function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 5) {
    let lastResponse: Response | null = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, init);

            if (response.ok || attempt === attempts) {
                return response;
            }

            lastResponse = response;
        } catch (error) {
            if (attempt === attempts) {
                throw error;
            }
        }

        await wait(250 * attempt);
    }

    return lastResponse;
}

async function fetchLimitlessDecklist(deck: RogueDeck) {
    const decklistUrl = getLimitlessDecklistUrl(deck);

    if (!decklistUrl) {
        return null;
    }

    try {
        const response = await fetchWithRetry(decklistUrl, {
            cache: "force-cache",
        });

        if (!response?.ok) {
            return null;
        }

        return extractLimitlessDecklist(await response.text());
    } catch {
        return null;
    }
}

async function hydrateMissingDecklists(decks: RogueDeck[]) {
    const hydratedDecks = await Promise.all(
        decks.map(async (deck) => {
            if (hasDecklist(deck)) {
                return deck;
            }

            const decklistExport = await fetchLimitlessDecklist(deck);

            return {
                ...deck,
                decklist_export: decklistExport ?? deck.decklist_export,
            };
        })
    );

    return hydratedDecks.filter(hasDecklist).slice(0, 5);
}

export async function getRogueDecks(
    date: string
): Promise<RogueDeckResponse> {
    const params = new URLSearchParams({
        date,
        build: BUILD_CACHE_KEY,
    });
    const url = `${API_BASE_URL}/meta/rogue?${params.toString()}`;
    const response = await fetchWithRetry(url, {
        cache: "force-cache",
    });

    if (!response?.ok) {
        throw new Error("Failed to load rogue decks.");
    }

    const data = (await response.json()) as RogueDeckResponse;

    return {
        ...data,
        rogueDecks: await hydrateMissingDecklists(data.rogueDecks ?? []),
    };
}

export async function getAvailableDates(): Promise<AvailableDatesResponse> {
    const response = await fetchWithRetry(
        `${API_BASE_URL}/meta/available-dates?build=${BUILD_CACHE_KEY}`,
        {
            cache: "force-cache",
        }
    );

    if (!response?.ok) {
        throw new Error("Failed to load available dates.");
    }

    return response.json();
}