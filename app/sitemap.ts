import type { MetadataRoute } from "next";
import { getAvailableDates } from "@/lib/api";
import { filterAccurateReportDates } from "@/lib/accurate-dates";

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
        ...accurateDates.map((date) => ({
            url: absoluteUrl(`/decks-of-the-day/${date}`),
            lastModified: new Date(date + "T00:00:00Z"),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}

