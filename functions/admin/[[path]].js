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

function getApiBaseUrl(env) {
    return (env.NEXT_PUBLIC_API_BASE_URL || env.API_BASE_URL || "").replace(
        /\/$/,
        ""
    );
}

function getJsonHeaders(env, headers = {}) {
    return {
        "Content-Type": "application/json",
        ...(env.ADMIN_API_TOKEN
            ? { Authorization: `Bearer ${env.ADMIN_API_TOKEN}` }
            : {}),
        ...headers,
    };
}

async function readJson(request) {
    try {
        return await request.json();
    } catch {
        return null;
    }
}

async function proxyJson(request, env, targetUrl, init = {}) {
    const response = await fetch(targetUrl, {
        method: init.method || request.method,
        headers: getJsonHeaders(env, init.headers),
        body: init.body,
    });
    const responseText = await response.text();
    let data = null;

    try {
        data = responseText ? JSON.parse(responseText) : null;
    } catch {
        data = { message: responseText };
    }

    if (!response.ok) {
        return json(
            {
                success: false,
                error:
                    data?.error ||
                    data?.message ||
                    `API request failed with status ${response.status}.`,
            },
            { status: response.status }
        );
    }

    return data;
}

function getYesterdayDate() {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}

async function handleMetaDeckCriteria(request, env, url) {
    const apiBaseUrl = getApiBaseUrl(env);

    if (!apiBaseUrl) {
        return json(
            {
                success: false,
                error: "NEXT_PUBLIC_API_BASE_URL or API_BASE_URL is not configured.",
            },
            { status: 503 }
        );
    }

    const criteriaEndpoint =
        env.META_DECK_CRITERIA_ENDPOINT ||
        `${apiBaseUrl}/admin/meta-deck-criteria`;
    const repopulateEndpoint =
        env.DECK_OF_THE_DAY_REPOPULATE_ENDPOINT ||
        `${apiBaseUrl}/admin/deck-of-the-day/repopulate`;

    if (request.method === "GET") {
        const data = await proxyJson(request, env, criteriaEndpoint, {
            method: "GET",
            body: undefined,
        });

        if (data instanceof Response) {
            return data;
        }

        return json({
            success: true,
            criteria: data.criteria || data.metaDeckCriteria || [],
        });
    }

    if (request.method === "DELETE") {
        const id = url.searchParams.get("id");

        if (!id) {
            return json(
                { success: false, error: "Missing criteria id." },
                { status: 400 }
            );
        }

        const deleteUrl = new URL(criteriaEndpoint);
        deleteUrl.searchParams.set("id", id);

        const data = await proxyJson(request, env, deleteUrl.toString(), {
            method: "DELETE",
            body: undefined,
        });

        if (data instanceof Response) {
            return data;
        }

        return json({
            success: true,
            criteria: data.criteria || data.metaDeckCriteria || [],
        });
    }

    if (request.method !== "POST") {
        return json(
            { success: false, error: "Method not allowed." },
            { status: 405, headers: { Allow: "GET, POST, DELETE" } }
        );
    }

    const body = await readJson(request);

    if (!body?.archetype || !Array.isArray(body.criteria)) {
        return json(
            {
                success: false,
                error: "Add an archetype and at least one criteria line.",
            },
            { status: 400 }
        );
    }

    const createdAt = new Date();
    const expiresAt = body.expiresAt
        ? new Date(body.expiresAt)
        : new Date(createdAt.getTime() + 28 * 24 * 60 * 60 * 1000);
    const refreshDate = body.refreshDate || getYesterdayDate();
    const savePayload = {
        ...body,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    const saveData = await proxyJson(request, env, criteriaEndpoint, {
        method: "POST",
        body: JSON.stringify(savePayload),
    });

    if (saveData instanceof Response) {
        return saveData;
    }

    const repopulateData = await proxyJson(request, env, repopulateEndpoint, {
        method: "POST",
        body: JSON.stringify({ date: refreshDate }),
    });

    if (repopulateData instanceof Response) {
        return repopulateData;
    }

    return json({
        success: true,
        message: `Saved. ${refreshDate} has been queued for repopulation.`,
        criteria: saveData.criteria || saveData.metaDeckCriteria || [],
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

function withDateParam(endpoint, date) {
    const replacedEndpoint = endpoint.replace("{date}", encodeURIComponent(date));

    if (replacedEndpoint !== endpoint) {
        return replacedEndpoint;
    }

    const url = new URL(replacedEndpoint);
    url.searchParams.set("date", date);
    return url.toString();
}

async function handleYesterdayImport(request, env) {
    if (request.method !== "POST" && request.method !== "DELETE") {
        return json(
            { success: false, error: "Method not allowed." },
            { status: 405, headers: { Allow: "POST, DELETE" } }
        );
    }

    const apiBaseUrl = getApiBaseUrl(env);

    if (!apiBaseUrl) {
        return json(
            {
                success: false,
                error: "NEXT_PUBLIC_API_BASE_URL or API_BASE_URL is not configured.",
            },
            { status: 503 }
        );
    }

    const body = await readJson(request);
    const date = body?.date || getYesterdayDate();
    const importEndpoint =
        env.IMPORT_YESTERDAY_ENDPOINT ||
        env.DAILY_IMPORT_ENDPOINT ||
        `${apiBaseUrl}/admin/import/yesterday`;
    const deleteEndpoint =
        env.DELETE_YESTERDAY_ENDPOINT ||
        env.DAILY_DELETE_ENDPOINT ||
        `${apiBaseUrl}/admin/import/yesterday`;
    const isDelete = request.method === "DELETE";
    const endpoint = isDelete ? deleteEndpoint : importEndpoint;
    const targetUrl = isDelete ? withDateParam(endpoint, date) : endpoint;
    const data = await proxyJson(request, env, targetUrl, {
        method: request.method,
        body: isDelete ? undefined : JSON.stringify({ date }),
    });

    if (data instanceof Response) {
        return data;
    }

    return json({
        success: true,
        date,
        message:
            data?.message ||
            (isDelete
                ? `Deleted data for ${date}.`
                : `Import started for ${date}.`),
        data,
    });
}

async function handleImportHistory(request, env, url) {
    if (request.method !== "GET" && request.method !== "DELETE") {
        return json(
            { success: false, error: "Method not allowed." },
            { status: 405, headers: { Allow: "GET, DELETE" } }
        );
    }

    const apiBaseUrl = getApiBaseUrl(env);

    if (!apiBaseUrl) {
        return json(
            {
                success: false,
                error: "NEXT_PUBLIC_API_BASE_URL or API_BASE_URL is not configured.",
            },
            { status: 503 }
        );
    }

    const importsEndpoint =
        env.IMPORT_HISTORY_ENDPOINT || `${apiBaseUrl}/admin/imports`;
    const targetUrl = new URL(importsEndpoint);

    if (request.method === "GET") {
        const limit = url.searchParams.get("limit");

        if (limit) {
            targetUrl.searchParams.set("limit", limit);
        }
    }

    if (request.method === "DELETE") {
        const date = url.searchParams.get("date");

        if (!date) {
            return json(
                { success: false, error: "Missing import date." },
                { status: 400 }
            );
        }

        targetUrl.searchParams.set("date", date);
    }

    const data = await proxyJson(request, env, targetUrl.toString(), {
        method: request.method,
        body: undefined,
    });

    if (data instanceof Response) {
        return data;
    }

    return json({
        success: true,
        latestImport: data.latestImport ?? null,
        imports: data.imports ?? [],
        message: data.message,
    });
}export async function onRequest(context) {
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
    const path = url.pathname.replace(/\/$/, "");

    if (path === "/admin/redeploy") {
        return handleRedeploy(context.request, context.env);
    }


    if (path === "/admin/imports/data") {
        return handleImportHistory(context.request, context.env, url);
    }

    if (path === "/admin/import/yesterday") {
        return handleYesterdayImport(context.request, context.env);
    }

    if (path === "/admin/meta-deck-criteria/data") {
        return handleMetaDeckCriteria(context.request, context.env, url);
    }

    const response = await context.next();
    response.headers.set("Cache-Control", "private, no-store");

    return response;
}
