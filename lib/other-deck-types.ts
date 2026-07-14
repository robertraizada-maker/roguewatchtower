export interface OtherDeckTypeCriterion {
    minQuantity: number;
    pokemonName: string;
}

export interface OtherDeckType {
    archetype: string;
    criteria: OtherDeckTypeCriterion[];
}

export const OTHER_DECK_TYPES_STORAGE_KEY = "roguewatchtower:other-deck-types";

export const defaultOtherDeckTypes: OtherDeckType[] = [
    {
        archetype: "Drakloak Control",
        criteria: [
            { minQuantity: 3, pokemonName: "Dreepy" },
            { minQuantity: 3, pokemonName: "Drakloak" },
            { minQuantity: 1, pokemonName: "Elgyem" },
        ],
    },
    {
        archetype: "Orthworm ex",
        criteria: [
            { minQuantity: 2, pokemonName: "Orthworm ex" },
            { minQuantity: 3, pokemonName: "Beldum" },
            { minQuantity: 3, pokemonName: "Metang" },
        ],
    },
    {
        archetype: "Crabominable Dudunsparce",
        criteria: [
            { minQuantity: 3, pokemonName: "Crabominable" },
            { minQuantity: 2, pokemonName: "Dudunsparce" },
        ],
    },
    {
        archetype: "Luxray Dudunsparce",
        criteria: [
            { minQuantity: 2, pokemonName: "Luxray ex" },
            { minQuantity: 2, pokemonName: "Dudunsparce" },
        ],
    },
    {
        archetype: "Arboliva Crobat",
        criteria: [
            { minQuantity: 2, pokemonName: "Team Rocket's Crobat" },
            { minQuantity: 2, pokemonName: "Arboliva ex" },
        ],
    },
    {
        archetype: "Floette Azumarill",
        criteria: [
            { minQuantity: 2, pokemonName: "Mega Floette ex" },
            { minQuantity: 2, pokemonName: "Azumarill ex" },
        ],
    },
];

const defaultFeaturedPokemonNameMatches: Array<{
    archetype: string;
    pokemonNames: string[];
}> = [
    {
        archetype: "Drakloak Control",
        pokemonNames: ["Dreepy", "Drakloak"],
    },
    {
        archetype: "Orthworm ex",
        pokemonNames: ["Beldum", "Metang"],
    },
    {
        archetype: "Crabominable Dudunsparce",
        pokemonNames: ["Dunsparce", "Crabrawler"],
    },
];

export function normalisePokemonName(name: string) {
    return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function getMatchingPokemonCount(
    pokemonCounts: Map<string, number>,
    pokemonName: string
) {
    const normalisedPokemonName = normalisePokemonName(pokemonName);
    const exactCount = pokemonCounts.get(normalisedPokemonName);

    if (exactCount !== undefined) {
        return exactCount;
    }

    let matchingCount = 0;

    pokemonCounts.forEach((count, cardName) => {
        if (cardName.startsWith(`${normalisedPokemonName} `)) {
            matchingCount += count;
        }
    });

    return matchingCount;
}

export function findMatchingOtherDeckType(
    pokemonCounts: Map<string, number>,
    otherDeckTypes: OtherDeckType[] = defaultOtherDeckTypes
) {
    return (
        otherDeckTypes.find((deckType) =>
            deckType.criteria.every((criterion) => {
                const count = getMatchingPokemonCount(
                    pokemonCounts,
                    criterion.pokemonName
                );

                return count >= criterion.minQuantity;
            })
        ) ?? null
    );
}

export function findMatchingFeaturedOtherDeckType(
    featuredPokemonNames: string[],
    featuredPokemonNameMatches = defaultFeaturedPokemonNameMatches
) {
    const featuredNameSet = new Set(featuredPokemonNames.map(normalisePokemonName));

    return (
        featuredPokemonNameMatches.find((deckType) =>
            deckType.pokemonNames.every((name) =>
                featuredNameSet.has(normalisePokemonName(name))
            )
        ) ?? null
    );
}

export function parseOtherDeckTypeCriteria(criteriaText: string) {
    return criteriaText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const match = /^(\d+)\s*,?\s+(.+)$/.exec(line);

            if (!match) {
                return null;
            }

            return {
                minQuantity: Number(match[1]),
                pokemonName: match[2].trim(),
            };
        })
        .filter((criterion): criterion is OtherDeckTypeCriterion => criterion !== null);
}

export function formatOtherDeckTypeCriteria(criteria: OtherDeckTypeCriterion[]) {
    return criteria
        .map((criterion) => `${criterion.minQuantity} ${criterion.pokemonName}`)
        .join("\n");
}