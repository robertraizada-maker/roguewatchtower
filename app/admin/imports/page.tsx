import type { Metadata } from "next";
import AdminBreadcrumbs from "../AdminBreadcrumbs";
import ImportHistoryManager from "./ImportHistoryManager";

export const metadata: Metadata = {
    title: "Import History",
};

export default function AdminImportsPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900">
            <section className="mx-auto max-w-6xl px-6 py-12">
                <AdminBreadcrumbs currentPage="Import History" />

                <h1 className="text-4xl font-bold tracking-tight">Import History</h1>

                <p className="mt-4 text-slate-600">
                    Review daily imports and delete a report date when it needs to be rebuilt.
                </p>

                <ImportHistoryManager />
            </section>
        </main>
    );
}