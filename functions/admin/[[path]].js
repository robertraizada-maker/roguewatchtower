const DEFAULT_ADMIN_USERNAME = "robert.raizada";

function unauthorized() {
    return new Response("Authentication required.", {
        status: 401,
        headers: {
            "WWW-Authenticate": 'Basic realm="Rogue Watchtower Admin", charset="UTF-8"',
            "Cache-Control": "no-store",
        },
    });
}

function unavailable(env) {
    const visibleKeys = Object.keys(env || {})
        .filter((key) => !key.toLowerCase().includes("password"))
        .sort()
        .join(", ") || "none";

    return new Response(`Admin authentication is not configured. Visible env keys: ${visibleKeys}`, {
        status: 503,
        headers: {
            "Cache-Control": "no-store",
        },
    });
}

function parseBasicAuth(request) {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Basic ")) {
        return null;
    }

    try {
        const decoded = atob(authorization.slice("Basic ".length));
        const separatorIndex = decoded.indexOf(":");

        if (separatorIndex === -1) {
            return null;
        }

        return {
            username: decoded.slice(0, separatorIndex),
            password: decoded.slice(separatorIndex + 1),
        };
    } catch {
        return null;
    }
}

function timingSafeEqual(left, right) {
    if (left.length !== right.length) {
        return false;
    }

    let difference = 0;

    for (let index = 0; index < left.length; index += 1) {
        difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }

    return difference === 0;
}

function json(data, init = {}) {
    return new Response(JSON.stringify(data), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, no-store",
            ...(init.headers || {}),
        },
    });
}

async function handleRedeploy(request, env) {
    if (request.method !== "POST") {
        return json(
            { success: false, error: "Method not allowed." },
            { status: 405, headers: { Allow: "POST" } }
        );
    }

    const deployHookUrl = env.CLOUDFLARE_PAGES_DEPLOY_HOOK_URL;

    if (!deployHookUrl) {
        const visibleKeys = Object.keys(env || {})
            .filter((key) => !key.toLowerCase().includes("password"))
            .sort()
            .join(", ") || "none";

        return json(
            {
                success: false,
                error: `CLOUDFLARE_PAGES_DEPLOY_HOOK_URL is not configured. Visible env keys: ${visibleKeys}`,
            },
            { status: 503 }
        );
    }

    const deployResponse = await fetch(deployHookUrl, {
        method: "POST",
    });

    if (!deployResponse.ok) {
        return json(
            {
                success: false,
                error: `Deploy hook failed with status ${deployResponse.status}.`,
            },
            { status: 502 }
        );
    }

    return json({
        success: true,
        message: "Redeploy started.",
    });
}

export async function onRequest(context) {
    const expectedUsername =
        context.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME;
    const expectedPassword = context.env.ADMIN_PASSWORD;

    if (!expectedPassword) {
        return unavailable(context.env);
    }

    const credentials = parseBasicAuth(context.request);

    if (!credentials) {
        return unauthorized();
    }

    const usernameMatches = timingSafeEqual(
        credentials.username,
        expectedUsername
    );
    const passwordMatches = timingSafeEqual(
        credentials.password,
        expectedPassword
    );

    if (!usernameMatches || !passwordMatches) {
        return unauthorized();
    }

    const url = new URL(context.request.url);

    if (url.pathname.replace(/\/$/, "") === "/admin/redeploy") {
        return handleRedeploy(context.request, context.env);
    }

    const response = await context.next();
    response.headers.set("Cache-Control", "private, no-store");

    return response;
}
