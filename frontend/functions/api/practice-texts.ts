type Env = {
  MONGODB_DATA_API_URL?: string;
  MONGODB_DATA_API_KEY?: string;
  MONGODB_APP_ID?: string;
  MONGODB_CLUSTER_NAME?: string;
};

export async function onRequestGet(context: {
  env: Env;
  request: Request;
}): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control":
      "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  };

  const env = context.env;
  const apiUrl = env.MONGODB_DATA_API_URL;
  const apiKey = env.MONGODB_DATA_API_KEY;
  const cluster =
    typeof env.MONGODB_CLUSTER_NAME === "string" &&
    env.MONGODB_CLUSTER_NAME !== ""
      ? env.MONGODB_CLUSTER_NAME
      : "test";

  // If MongoDB Data API credentials are configured in Cloudflare
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
          limit: 500,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { documents?: unknown[] };
        if (data.documents && Array.isArray(data.documents)) {
          return new Response(JSON.stringify(data.documents), {
            status: 200,
            headers,
          });
        }
      }
    } catch (err) {
      console.error(
        "Failed to query MongoDB Data API from Cloudflare Worker:",
        err,
      );
    }
  }

  // Fallback: fetch from static practice_texts.json
  try {
    const url = new URL(context.request.url);
    const staticUrl = `${url.origin}/practice/practice_texts.json`;
    const staticRes = await fetch(staticUrl);
    if (staticRes.ok) {
      const texts = await staticRes.text();
      return new Response(texts, {
        status: 200,
        headers,
      });
    }
  } catch (err) {
    console.error("Static fallback failed:", err);
  }

  return new Response(JSON.stringify([]), {
    status: 200,
    headers,
  });
}
