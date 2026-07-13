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

    const response = await context.next();
    response.headers.set("Cache-Control", "private, no-store");

    return response;
}
