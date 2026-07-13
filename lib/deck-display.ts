import {
    findMatchingFeaturedOtherDeckType,
    findMatchingOtherDeckType,
    normalisePokemonName,
    type OtherDeckType,
} from "@/lib/other-deck-types";

interface PokemonCardLine {
    quantity: number;
    name: string;
    setCode: string;
    cardNumber: number;
    order: number;
}

function parsePokemonCardLine(line: string, order: number): PokemonCardLine | null {
    const match = /^(\d+)\s+(.+)\s+([A-Z0-9]{2,8})\s+([A-Z]*\d+[a-z]?)$/i.exec(line.trim());

    if (!match) {
        return null;
    }

    const cardNumberMatch = /\d+/.exec(match[4]);

    return {
        quantity: Number(match[1]),
        name: match[2].trim(),
        setCode: match[3].toUpperCase(),
        cardNumber: cardNumberMatch ? Number(cardNumberMatch[0]) : Number.MAX_SAFE_INTEGER,
        order,
    };
}

function getPokemonLines(decklistExport: string) {
    const lines = decklistExport.split(/\r?\n/);
    const pokemonHeaderIndex = lines.findIndex((line) =>
        /^pok.mon:/i.test(line.trim())
    );

    if (pokemonHeaderIndex === -1) {
        return [];
    }

    const sectionLines: string[] = [];

    for (const line of lines.slice(pokemonHeaderIndex + 1)) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        if (/^(trainer|energy):/i.test(trimmed)) {
            break;
        }

        sectionLines.push(trimmed);
    }

    return sectionLines;
}

function getFeaturedPokemonNames(decklistExport: string | null) {
    if (!decklistExport) {
        return [];
    }

    const cards = getPokemonLines(decklistExport)
        .map((line, index) => parsePokemonCardLine(line, index))
        .filter((card): card is PokemonCardLine => card !== null)
        .sort((a, b) => {
            if (b.quantity !== a.quantity) {
                return b.quantity - a.quantity;
            }

            if (a.setCode !== b.setCode) {
                return a.setCode.localeCompare(b.setCode);
            }

            if (a.cardNumber !== b.cardNumber) {
                return a.cardNumber - b.cardNumber;
            }

            return a.order - b.order;
        })
        .slice(0, 2)
        .sort((a, b) => {
            if (a.setCode !== b.setCode) {
                return a.setCode.localeCompare(b.setCode);
            }

            if (a.cardNumber !== b.cardNumber) {
                return a.cardNumber - b.cardNumber;
            }

            return a.order - b.order;
        });

    return cards.map((card) => card.name);
}

function getPokemonCounts(decklistExport: string | null) {
    const counts = new Map<string, number>();

    if (!decklistExport) {
        return counts;
    }

    getPokemonLines(decklistExport)
        .map((line, index) => parsePokemonCardLine(line, index))
        .filter((card): card is PokemonCardLine => card !== null)
        .forEach((card) => {
            const name = normalisePokemonName(card.name);
            counts.set(name, (counts.get(name) ?? 0) + card.quantity);
        });

    return counts;
}

export function getDeckDisplayName(
    deckName: string,
    decklistExport: string | null,
    otherDeckTypes?: OtherDeckType[]
) {
    if (deckName !== "Other") {
        return deckName;
    }

    const matchingDeckType = findMatchingOtherDeckType(
        getPokemonCounts(decklistExport),
        otherDeckTypes
    );

    if (matchingDeckType) {
        return matchingDeckType.archetype;
    }

    const featuredPokemonNames = getFeaturedPokemonNames(decklistExport);
    const matchingFeaturedDeckType =
        findMatchingFeaturedOtherDeckType(featuredPokemonNames);

    if (matchingFeaturedDeckType) {
        return matchingFeaturedDeckType.archetype;
    }

    if (featuredPokemonNames.length === 0) {
        return deckName;
    }

    return `${deckName} - ${featuredPokemonNames.join(", ")}`;
}
