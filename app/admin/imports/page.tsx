import type { Metadata } from "next";
import AdminBreadcrumbs from "../AdminBreadcrumbs";
import ImportHistoryManager from "./ImportHistoryManager";

export const metadata: Metadata = {
    title: "Manage Imports",
};

export default function AdminImportsPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-6xl px-6 py-12">
                <AdminBreadcrumbs currentPage="Manage Imports" />

                <h1 className="text-4xl font-bold tracking-tight">Manage Imports</h1>

                <p className="mt-4 text-slate-600">
                    Import tournament data for a report date, review past runs, and delete a date when it needs to be rebuilt.
                </p>

                <ImportHistoryManager />
            </section>
        </main>
    );
}