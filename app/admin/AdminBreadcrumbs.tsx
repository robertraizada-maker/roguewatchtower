import Link from "next/link";

interface AdminBreadcrumbsProps {
    currentPage?: string;
}

export default function AdminBreadcrumbs({ currentPage }: AdminBreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6 text-sm font-semibold">
            <ol className="flex flex-wrap items-center gap-2 text-slate-600">
                <li>
                    {currentPage ? (
                        <Link
                            href="/admin"
                            className="text-emerald-800 hover:text-emerald-950 hover:underline"
                        >
                            Admin
                        </Link>
                    ) : (
                        <span className="text-slate-900">Admin</span>
                    )}
                </li>

                {currentPage && (
                    <>
                        <li aria-hidden="true" className="text-slate-400">
                            /
                        </li>
                        <li aria-current="page" className="text-slate-900">
                            {currentPage}
                        </li>
                    </>
                )}
            </ol>
        </nav>
    );
}
