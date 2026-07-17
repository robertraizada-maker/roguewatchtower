import type { Metadata } from "next";
import AdminBreadcrumbs from "../AdminBreadcrumbs";
import MetaDeckCriteriaManager from "./MetaDeckCriteriaManager";

export const metadata: Metadata = {
    title: "Meta Deck Criteria",
};

export default function AdminMetaDeckCriteriaPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-5xl px-6 py-12">
                <AdminBreadcrumbs currentPage="Meta Deck Criteria" />

                <h1 className="text-4xl font-bold tracking-tight">
                    Meta Deck Criteria
                </h1>

                <p className="mt-4 text-slate-600">
                    Add temporary criteria for decks that should count as part of the
                    current meta. New criteria expire after 28 days and refresh
                    yesterday&apos;s deck of the day.
                </p>

                <MetaDeckCriteriaManager />
            </section>
        </main>
    );
}

