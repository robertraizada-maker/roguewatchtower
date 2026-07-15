export interface OtherDeckTypeCriterion {
    minQuantity: number;
    pokemonName: string;
}

export interface OtherDeckType {
    archetype: string;
    criteria: OtherDeckTypeCriterion[];
}

export const OTHER_DECK_TYPES_STORAGE_KEY = "roguewatchtower:other-deck-types";

interface StoredOtherDeckType {
    archetype?: string;
    criteriaText?: string;
}

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
    {
        archetype: "Arboliva Absol",
        criteria: [
            { minQuantity: 2, pokemonName: "Arboliva ex" },
            { minQuantity: 1, pokemonName: "Mega Absol ex" },
        ],
    },
    {
        archetype: "Cinccino Metang",
        criteria: [
            { minQuantity: 3, pokemonName: "Cinccino ex" },
            { minQuantity: 3, pokemonName: "Metang" },
        ],
    },
    {
        archetype: "Dusknoir",
        criteria: [
            { minQuantity: 3, pokemonName: "Duskull" },
            { minQuantity: 3, pokemonName: "Dusclops" },
            { minQuantity: 2, pokemonName: "Dusknoir" },
        ],
    },
    {
        archetype: "Delphox Emboar",
        criteria: [
            { minQuantity: 3, pokemonName: "Fennekin" },
            { minQuantity: 3, pokemonName: "Delphox" },
            { minQuantity: 2, pokemonName: "Emboar" },
        ],
    },
    {
        archetype: "Chandelure",
        criteria: [
            { minQuantity: 3, pokemonName: "Litwick" },
            { minQuantity: 3, pokemonName: "Chandelure" },
        ],
    },
    {
        archetype: "Mega Audino Cinderace",
        criteria: [
            { minQuantity: 2, pokemonName: "Mega Audino ex" },
            { minQuantity: 3, pokemonName: "Cinderace" },
        ],
    },
    {
        archetype: "Mega Kangaskhan Dusknoir",
        criteria: [
            { minQuantity: 2, pokemonName: "Mega Kangaskhan ex" },
            { minQuantity: 2, pokemonName: "Duskull" },
        ],
    },
    {
        archetype: "Slop Box Jellicent",
        criteria: [
            { minQuantity: 3, pokemonName: "Mega Kangaskhan ex" },
            { minQuantity: 2, pokemonName: "Jellicent ex" },
        ],
    },
    {
        archetype: "Mega Gardevoir",
        criteria: [
            { minQuantity: 3, pokemonName: "Ralts" },
            { minQuantity: 2, pokemonName: "Mega Gardevoir ex" },
        ],
    },
    {
        archetype: "Arboliva Ogerpon",
        criteria: [
            { minQuantity: 2, pokemonName: "Smoliv" },
            { minQuantity: 2, pokemonName: "Teal Mask Ogerpon" },
        ],
    },
    {
        archetype: "Froslass",
        criteria: [
            { minQuantity: 3, pokemonName: "Snorunt" },
            { minQuantity: 3, pokemonName: "Froslass" },
        ],
    },
    {
        archetype: "Tyrantrum",
        criteria: [
            { minQuantity: 3, pokemonName: "Tyrunt" },
            { minQuantity: 3, pokemonName: "Tyrantrum" },
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
    {
        archetype: "Slop Box Jellicent",
        pokemonNames: ["Lillie's Clefairy ex", "Mega Kangaskhan ex"],
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

export function parseStoredOtherDeckTypes(storedValue: string | null) {
    if (!storedValue) {
        return undefined;
    }

    try {
        const storedDeckTypes = JSON.parse(storedValue) as StoredOtherDeckType[];

        if (!Array.isArray(storedDeckTypes)) {
            return undefined;
        }

        const otherDeckTypes = storedDeckTypes
            .map((deckType): OtherDeckType | null => {
                const archetype = deckType.archetype?.trim();
                const criteria = parseOtherDeckTypeCriteria(
                    deckType.criteriaText ?? ""
                );

                if (!archetype || criteria.length === 0) {
                    return null;
                }

                return {
                    archetype,
                    criteria,
                };
            })
            .filter((deckType): deckType is OtherDeckType => deckType !== null);

        return otherDeckTypes.length > 0 ? otherDeckTypes : undefined;
    } catch {
        return undefined;
    }
}
