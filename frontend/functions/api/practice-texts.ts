type Env = {
  MONGODB_DATA_API_URL?: string;
  MONGODB_DATA_API_KEY?: string;
  MONGODB_APP_ID?: string;
  MONGODB_CLUSTER_NAME?: string;
};

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `"${Math.abs(hash).toString(36)}-${str.length.toString(36)}"`;
}

export async function onRequestGet(context: {
  env: Env;
  request: Request;
}): Promise<Response> {
  const req = context.request;
  const clientEtag = req.headers.get("If-None-Match");

  const env = context.env;
  const apiUrl = env.MONGODB_DATA_API_URL;
  const apiKey = env.MONGODB_DATA_API_KEY;
  const cluster =
    typeof env.MONGODB_CLUSTER_NAME === "string" &&
    env.MONGODB_CLUSTER_NAME !== ""
      ? env.MONGODB_CLUSTER_NAME
      : "test";

  let textsPayload: string | null = null;

  // 1. If MongoDB Data API credentials are configured in Cloudflare
  if (
    typeof apiUrl === "string" &&
    apiUrl !== "" &&
    typeof apiKey === "string" &&
    apiKey !== ""
  ) {
    try {
      const response = await fetch(`${apiUrl}/action/find`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          dataSource: cluster,
          database: "eepytype",
          collection: "practice_texts",
          sort: { category: 1, title: 1 },
          limit: 1000,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { documents?: unknown[] };
        if (
          data.documents !== undefined &&
          Array.isArray(data.documents) &&
          data.documents.length > 0
        ) {
          textsPayload = JSON.stringify(data.documents);
        }
      }
    } catch (err) {
      console.error(
        "Failed to query MongoDB Data API from Cloudflare Worker:",
        err,
      );
    }
  }

  // 2. Fallback: fetch from static practice_texts.json
  if (typeof textsPayload !== "string" || textsPayload === "") {
    try {
      const url = new URL(req.url);
      const staticUrl = `${url.origin}/practice/practice_texts.json`;
      const staticRes = await fetch(staticUrl);
      if (staticRes.ok) {
        textsPayload = await staticRes.text();
      }
    } catch (err) {
      console.error("Static fallback failed:", err);
    }
  }

  if (typeof textsPayload !== "string" || textsPayload === "") {
    textsPayload = JSON.stringify([]);
  }

  const etag = simpleHash(textsPayload);

  // If client already has this version cached, return 304 Not Modified
  if (typeof clientEtag === "string" && clientEtag === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response(textsPayload, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ETag: etag,
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
