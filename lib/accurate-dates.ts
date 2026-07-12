export function getOldestAccurateReportDate(now = new Date()) {
    const cutoff = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 28
    ));

    return cutoff.toISOString().slice(0, 10);
}

export function filterAccurateReportDates(
    dates: string[],
    now = new Date()
) {
    const oldestAccurateReportDate = getOldestAccurateReportDate(now);

    return dates.filter((date) => date >= oldestAccurateReportDate);
}