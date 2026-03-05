type BookmarkMetadata = {
  summary: string;
  tags: string[];
};

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 1200;

function extractJson(raw: string) {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRetryAfterMs(retryAfterHeader: string | null) {
  if (!retryAfterHeader) {
    return null;
  }

  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.round(seconds * 1000);
  }

  const dateMs = Date.parse(retryAfterHeader);
  if (Number.isFinite(dateMs)) {
    const diff = dateMs - Date.now();
    return diff > 0 ? diff : null;
  }

  return null;
}

async function callGeminiWithRetry(model: string, apiKey: string, prompt: string) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
        cache: "no-store",
      },
    );

    if (response.ok) {
      return response;
    }

    const isRetriable = response.status === 429 || response.status >= 500;
    if (!isRetriable || attempt === MAX_ATTEMPTS) {
      const errorText = await response.text();
      throw new Error(
        `Gemini request failed with status ${response.status}${
          errorText ? `: ${errorText.slice(0, 250)}` : ""
        }`,
      );
    }

    const retryAfterMs = getRetryAfterMs(response.headers.get("retry-after"));
    const backoffMs = retryAfterMs ?? BASE_DELAY_MS * 2 ** (attempt - 1);
    lastError = new Error(`Temporary Gemini API limit (${response.status}). Retrying.`);
    await wait(backoffMs);
  }

  throw lastError ?? new Error("Gemini request failed after retries");
}

export async function generateBookmarkMetadata(input: {
  title: string;
  url: string;
}): Promise<BookmarkMetadata> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const prompt = `
Generate bookmark metadata from this input.

Title: ${input.title}
URL: ${input.url}

Return strict JSON only with no markdown:
{
  "summary": "A concise summary under 35 words.",
  "tags": ["3 to 6 short lowercase tags"]
}
No additional keys.
`.trim();

  const response = await callGeminiWithRetry(model, apiKey, prompt);

  const payload = await response.json();
  const text =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("") || "";

  const parsed = JSON.parse(extractJson(text));

  if (!parsed || typeof parsed.summary !== "string" || !Array.isArray(parsed.tags)) {
    throw new Error("Gemini response has invalid JSON shape");
  }

  return {
    summary: parsed.summary.trim().slice(0, 300),
    tags: parsed.tags
      .map((tag: unknown) => String(tag).trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8),
  };
}
