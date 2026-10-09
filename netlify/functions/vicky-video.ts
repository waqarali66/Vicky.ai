// Netlify Function: secure Runway text-to-video generation and task status proxy.
const RUNWAY_BASE_URL = "https://api.dev.runwayml.com/v1";
const RUNWAY_VERSION = "2024-11-06";

function json(statusCode: number, payload: unknown) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event: any) => {
  const apiKey = process.env.RUNWAYML_API_SECRET;
  if (!apiKey) {
    return json(503, { success: false, error: "Runway is not configured. Add RUNWAYML_API_SECRET in Netlify environment variables." });
  }

  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*" }, body: "" };
    }

    const action = event.queryStringParameters?.action || "generate";
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "X-Runway-Version": RUNWAY_VERSION,
      "Content-Type": "application/json",
    };

    if (action === "status") {
      const taskId = event.queryStringParameters?.taskId;
      if (!taskId || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
        return json(400, { success: false, error: "A valid Runway taskId is required." });
      }
      const response = await fetch(`${RUNWAY_BASE_URL}/tasks/${encodeURIComponent(taskId)}`, { headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return json(response.status, { success: false, error: data?.error || data?.message || "Unable to check Runway task status." });
      }
      return json(200, {
        success: true,
        id: data.id,
        status: data.status,
        output: data.output || null,
        failure: data.failure || data.failureCode || null,
      });
    }

    if (event.httpMethod !== "POST") return json(405, { success: false, error: "Use POST to start video generation." });

    let body: any = {};
    try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { success: false, error: "Request body must be valid JSON." }); }
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return json(400, { success: false, error: "Enter a scene description before generating a clip." });
    if (prompt.length > 1000) return json(400, { success: false, error: "The prompt must be 1,000 characters or fewer." });

    const aspectRatio = body.aspectRatio === "9:16" ? "720:1280" : "1280:720";
    const duration = body.duration === 5 ? 5 : 10;
    const response = await fetch(`${RUNWAY_BASE_URL}/image_to_video`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gen4.5",
        promptText: prompt,
        ratio: aspectRatio,
        duration,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error || data?.message || data?.detail || `Runway request failed (${response.status}).`;
      return json(response.status, { success: false, error: typeof detail === "string" ? detail : JSON.stringify(detail) });
    }
    return json(202, { success: true, taskId: data.id, status: data.status || "PENDING", model: "gen4.5", duration });
  } catch (error: any) {
    return json(500, { success: false, error: error?.message || "Unexpected Runway API error." });
  }
};
