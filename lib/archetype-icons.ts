const ICON_BASE_URL = "https://r2.limitlesstcg.net/pokemon/gen9";

const ARCHETYPE_ICON_SLUGS: Record<string, string[]> = {
    "Blissey": ["blissey"],
    "Crustle": ["crustle"],
    "Arboliva Crobat": ["arboliva", "crobat"],
    "Drakloak Control": ["drakloak"],
    "Luxray Dudunsparce": ["luxray", "dudunsparce"],
    "Dragapult Blaziken": ["dragapult", "blaziken"],
    "Dragapult Iron Thorns": ["dragapult", "iron-thorns"],
    "Erika's Victreebel": ["victreebel"],
    "Heatran Metang": ["heatran", "metang"],
    "Iron Thorns": ["iron-thorns"],
    "Mega Audino": ["audino"],
    "Mega Camerupt": ["camerupt-mega"],
    "Mega Manectric": ["manectric-mega"],
    "Mega Lopunny": ["lopunny-mega"],
    "Okidogi Barbaracle": ["okidogi", "barbaracle"],
    "Other": ["https://limitless3.nyc3.cdn.digitaloceanspaces.com/pokemon/substitute.png"],
};

const ICON_NAME_OVERRIDES: Record<string, string> = {
    "iono's bellibolt": "bellibolt",
    "lillie's clefairy": "clefairy",
    "marnie's grimmsnarl": "grimmsnarl",
    "mega charizard x": "charizard-mega-x",
    "misty's gyarados": "gyarados",
    "paldean tauros": "tauros",
    "rocket's spidops": "spidops",
    "team rocket's chingling": "chingling",
    "team rocket's golbat": "golbat",
    "team rocket's zubat": "zubat",
    "teal mask ogerpon": "ogerpon",
};
const MULTI_WORD_ICON_NAMES = [
    "Team Rocket's Golbat",
    "Team Rocket's Zubat",
    "Team Rocket's Chingling",
    "Teal Mask Ogerpon",
    "Mega Charizard X",
    "Marnie's Grimmsnarl",
    "Misty's Gyarados",
    "Lillie's Clefairy",
    "Iono's Bellibolt",
    "Paldean Tauros",
    "Rocket's Spidops",
    "Mega Abomasnow",
    "Mega Camerupt",
    "Mega Dragonite",
    "Mega Lopunny",
    "Mega Manectric",
    "Mega Gengar",
    "Mega Zygarde",
    "Iron Thorns",
    "Raging Bolt",
].sort((a, b) => b.length - a.length);

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

function getIconSlug(name: string) {
    const normalized = name
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\bex\b/gi, "")
        .trim()
        .toLowerCase();

    if (ICON_NAME_OVERRIDES[normalized]) {
        return ICON_NAME_OVERRIDES[normalized];
    }

    const megaMatch = /^mega\s+(.+)$/.exec(normalized);

    if (megaMatch) {
        return `${slugifyPokemonName(megaMatch[1])}-mega`;
    }

    return slugifyPokemonName(normalized);
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

function getArchetypePokemonNames(archetype: string) {
    const otherPokemonNames = getOtherPokemonNames(archetype);

    if (otherPokemonNames.length > 0) {
        return otherPokemonNames;
    }

    const names: string[] = [];
    let remaining = archetype.trim();

    while (remaining && names.length < 2) {
        const megaFallbackMatch = /^mega\s+(\S+)/i.exec(remaining);

        if (megaFallbackMatch) {
            names.push(megaFallbackMatch[1]);
            remaining = remaining.slice(megaFallbackMatch[0].length).trim();
            continue;
        }

        const matchedName = MULTI_WORD_ICON_NAMES.find((name) =>
            remaining.toLowerCase().startsWith(name.toLowerCase())
        );

        if (matchedName) {
            names.push(matchedName);
            remaining = remaining.slice(matchedName.length).trim();
            continue;
        }

        const [name, ...rest] = remaining.split(/\s+/);
        names.push(name);
        remaining = rest.join(" ").trim();
    }

    return names.filter(Boolean);
}

export function getArchetypeIconUrls(
    archetype: string,
    explicitIconUrls?: string[]
) {
    if (explicitIconUrls && explicitIconUrls.length > 0) {
        return explicitIconUrls;
    }

    const slugs =
        ARCHETYPE_ICON_SLUGS[archetype] ||
        getArchetypePokemonNames(archetype).map(getIconSlug).filter(Boolean);

    return slugs.map((slug) =>
        slug.startsWith("http") ? slug : `${ICON_BASE_URL}/${slug}.png`
    );
}
