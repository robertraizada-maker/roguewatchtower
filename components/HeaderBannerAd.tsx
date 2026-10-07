"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function BannerUnit() {
    const ad = useRef<HTMLModElement>(null);
    const requested = useRef(false);

    useEffect(() => {
        if (!ad.current || requested.current) return;
        requested.current = true;
        try {
            const adWindow = window as Window & {
                adsbygoogle?: Record<string, never>[];
            };
            (adWindow.adsbygoogle = adWindow.adsbygoogle || []).push({});
        } catch {
            // Keep the page usable when advertising is blocked or unavailable.
        }
    }, []);

    return (
        <aside aria-label="Advertisement" className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
            <ins
                ref={ad}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-7835770856697607"
                data-ad-slot="9629236059"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </aside>
    );
}

export default function HeaderBannerAd() {
    const pathname = usePathname();
    if (!pathname || pathname === "/admin" || pathname.startsWith("/admin/")) {
        return null;
    }
    return <BannerUnit key={pathname} />;
}