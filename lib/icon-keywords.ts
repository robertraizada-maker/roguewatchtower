export const ICON_KEYWORDS_STORAGE_KEY = "roguewatchtower:icon-keywords";

export const defaultIgnoredIconKeywords = ["Slop", "Box"];

export function parseIgnoredIconKeywords(storedValue: string | null) {
    if (!storedValue) {
        return defaultIgnoredIconKeywords;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as unknown;

        if (!Array.isArray(parsedValue)) {
            return defaultIgnoredIconKeywords;
        }

        const keywords = parsedValue
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean);

        return keywords.length > 0 ? keywords : defaultIgnoredIconKeywords;
    } catch {
        return defaultIgnoredIconKeywords;
    }
}