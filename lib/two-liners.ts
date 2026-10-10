/** Count distinct card entries, ignoring copy quantities and section totals. */
export function getUniqueCardCount(decklist: string | null): number | null {
    if (!decklist?.trim()) return null;
    const cards = new Set<string>();
    for (const line of decklist.split(/\r?\n/)) {
        const match = /^\s*[1-9]\d*\s+(.+?)\s*$/.exec(line);
        if (match) cards.add(match[1].replace(/\s+/g, " ").toLowerCase());
    }
    return cards.size || null;
}
