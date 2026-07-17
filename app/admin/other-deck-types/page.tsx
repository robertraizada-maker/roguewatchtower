import type { Metadata } from "next";
import AdminBreadcrumbs from "../AdminBreadcrumbs";
import OtherDeckTypesManager from "./OtherDeckTypesManager";

export const metadata: Metadata = {
    title: "Other Deck Types",
};

export default function AdminOtherDeckTypesPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-5xl px-6 py-12">
                <AdminBreadcrumbs currentPage="Other Deck Types" />

                <h1 className="text-4xl font-bold tracking-tight">
                    Other Deck Types
                </h1>

                <p className="mt-4 text-slate-600">
                    Manage the criteria used to give named archetypes to decks that
                    arrive from Limitless as Other.
                </p>

                <OtherDeckTypesManager />
            </section>
        </main>
    );
}
