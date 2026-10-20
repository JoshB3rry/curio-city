/**
 * Image search tool via Openverse (free, no API key). Returns real, working
 * image URLs the model can drop into Image / ImageGallery components.
 *
 * Same shape as the get_weather tool: `searchImagesTool` declares it to the
 * model, `executeSearchImages` runs on the server.
 */

export const searchImagesTool = {
  type: "function" as const,
  name: "search_images",
  description:
    "Search the web for real photos matching a query. Use whenever the user asks " +
    "to see pictures, photos, or images of something. Returns direct image URLs " +
    "with titles — pass the URLs straight into Image or ImageGallery components " +
    "via their src props. Never invent image URLs; only use URLs this tool returns.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "What to search for, e.g. 'golden retriever puppy' or 'Tokyo at night'.",
      },
      count: {
        type: "number",
        description: "How many images to return (1-8, default 4).",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  strict: false,
};

interface OpenverseResult {
  id: string;
  title: string;
  url: string;
  foreign_landing_url?: string;
}

export async function executeSearchImages(
  argsJson: string,
  ctx: { signal?: AbortSignal } = {},
): Promise<string> {
  let query: string;
  let count = 4;
  try {
    const args = JSON.parse(argsJson || "{}") as { query?: unknown; count?: unknown };
    if (typeof args.query !== "string" || !args.query.trim()) {
      return JSON.stringify({ error: "query is required" });
    }
    query = args.query.trim();
    if (typeof args.count === "number" && args.count >= 1 && args.count <= 8) {
      count = Math.floor(args.count);
    }
  } catch {
    return JSON.stringify({ error: "invalid JSON arguments" });
  }

  try {
    const url = new URL("https://api.openverse.org/v1/images/");
    url.searchParams.set("q", query);
    url.searchParams.set("page_size", String(count));
    url.searchParams.set("filter_dead", "true");
    const res = await fetch(url, {
      signal: ctx.signal,
      headers: { "User-Agent": "Curio.city/1.0" },
    });
    if (!res.ok) {
      return JSON.stringify({ error: `Image search failed (HTTP ${res.status})` });
    }
    const data = (await res.json()) as { results?: OpenverseResult[] };
    const results = (data.results ?? [])
      .filter((r) => r.url && r.url.startsWith("https://"))
      .slice(0, count)
      .map((r) => ({ title: r.title || query, url: r.url }));
    if (!results.length) {
      return JSON.stringify({ error: `No images found for "${query}"` });
    }
    return JSON.stringify({ query, images: results });
  } catch (err) {
    return JSON.stringify({
      error: `Image search failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}
