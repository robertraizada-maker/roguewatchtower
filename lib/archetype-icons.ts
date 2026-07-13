const ICON_BASE_URL = "https://r2.limitlesstcg.net/pokemon/gen9";

const ARCHETYPE_ICON_SLUGS: Record<string, string[]> = {
    "Blissey": ["blissey"],
    "Crustle": ["crustle"],
    "Dragapult Blaziken": ["dragapult", "blaziken"],
    "Dragapult Iron Thorns": ["dragapult", "iron-thorns"],
    "Erika's Victreebel": ["victreebel"],
    "Heatran Metang": ["heatran", "metang"],
    "Iron Thorns": ["iron-thorns"],
    "Mega Camerupt": ["camerupt-mega"],
    "Mega Manectric": ["manectric-mega"],
    "Mega Lopunny": ["lopunny-mega"],
    "Okidogi Barbaracle": ["okidogi", "barbaracle"],
    "Other": ["https://limitless3.nyc3.cdn.digitaloceanspaces.com/pokemon/substitute.png"],
};

export function slugifyPokemonName(name: string) {
    return name
        .replace(/'s\b/gi, "")
        .replace(/\bex\b/gi, "")
        .replace(/\bmega\s+([a-z]+)/gi, "$1-mega")
        .replace(/[^a-z0-9-]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
}

function getOtherPokemonNames(archetype: string) {
    if (!archetype.startsWith("Other - ")) {
        return [];
    }

    return archetype
        .replace(/^Other - /, "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
}

export function getArchetypeIconUrls(
    archetype: string,
    explicitIconUrls?: string[]
) {
    if (explicitIconUrls && explicitIconUrls.length > 0) {
        return explicitIconUrls;
    }

    const otherPokemonNames = getOtherPokemonNames(archetype);
    const slugs =
        ARCHETYPE_ICON_SLUGS[archetype] ||
        (otherPokemonNames.length > 0
            ? otherPokemonNames.map(slugifyPokemonName)
            : archetype
                  .split(/\s+/)
                  .slice(0, 2)
                  .map(slugifyPokemonName))
            .filter(Boolean);

    return slugs.map((slug) =>
        slug.startsWith("http") ? slug : `${ICON_BASE_URL}/${slug}.png`
    );
}
