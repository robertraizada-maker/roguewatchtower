import type { MetadataRoute } from "next";
import { getAvailableDates } from "@/lib/api";
import { filterAccurateReportDates } from "@/lib/accurate-dates";
import { getArchetypes } from "@/lib/archetypes";
import { getRankingRangeHref } from "@/lib/ranking-ranges";

export const dynamic = "force-static";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://roguewatchtower.com";

function absoluteUrl(path: string) {
    return new URL(path, SITE_URL).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const result = await getAvailableDates();
    const now = new Date();
    const accurateDates = filterAccurateReportDates(result.dates, now);
    const archetypes = await getArchetypes();

    return [
        {
            url: absoluteUrl("/"),
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: absoluteUrl("/about"),
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: absoluteUrl("/rogue-ranking"),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        ...([14, 28] as const).map((range) => ({
            url: absoluteUrl(getRankingRangeHref(range)),
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.7,
        })),
        {
            url: absoluteUrl("/archtypes"),
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        ...archetypes.map((archetype) => ({
            url: absoluteUrl(`/archtypes/${archetype.slug}`),
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.6,
        })),
        {
            url: absoluteUrl("/search"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.6,
        },
        {
            url: absoluteUrl("/sitemap"),
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.4,
        },
        {
            url: absoluteUrl("/privacy-policy"),
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        ...accurateDates.map((date) => ({
            url: absoluteUrl(`/decks-of-the-day/${date}`),
            lastModified: new Date(date + "T00:00:00Z"),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
