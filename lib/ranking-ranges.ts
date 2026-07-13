export const RANKING_RANGE_OPTIONS = [7, 14, 28] as const;

export type RankingRange = (typeof RANKING_RANGE_OPTIONS)[number];

export function getRankingRangeHref(range: RankingRange) {
    return range === 7 ? "/rogue-ranking" : `/rogue-ranking/${range}days`;
}

export function parseRankingRange(value: string): RankingRange | null {
    const match = /^(7|14|28)days$/.exec(value);

    if (!match) {
        return null;
    }

    return Number(match[1]) as RankingRange;
}
