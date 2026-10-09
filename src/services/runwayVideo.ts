export interface RunwayClipResult {
  taskId: string;
  videoUrl: string;
  status: string;
}

const FUNCTION_URL = "/.netlify/functions/vicky-video";

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Video request failed (${response.status})`);
  }
  return data;
}

export async function generateRunwayClip(options: {
  prompt: string;
  aspectRatio?: string;
  duration?: 5 | 10;
  onStatus?: (status: string) => void;
}): Promise<RunwayClipResult> {
  const start = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: options.prompt,
      aspectRatio: options.aspectRatio || "16:9",
      duration: options.duration || 10,
    }),
  });
  const task = await readJson(start);
  if (!task.taskId) throw new Error("Runway did not return a task ID.");

  const deadline = Date.now() + 8 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => window.setTimeout(resolve, 4000));
    const response = await fetch(`${FUNCTION_URL}?action=status&taskId=${encodeURIComponent(task.taskId)}`);
    const statusData = await readJson(response);
    const status = String(statusData.status || "PROCESSING").toUpperCase();
    options.onStatus?.(status);

    if (status === "SUCCEEDED" || status === "COMPLETED") {
      const output = statusData.output;
      const videoUrl = Array.isArray(output) ? output.find((item: unknown) => typeof item === "string") : undefined;
      if (!videoUrl) throw new Error("Runway finished but returned no video URL.");
      return { taskId: task.taskId, videoUrl, status };
    }
    if (["FAILED", "CANCELED", "CANCELLED"].includes(status)) {
      throw new Error(`Runway video generation ${status.toLowerCase()}. Please try a different prompt.`);
    }
  }
  throw new Error("Video generation is taking longer than expected. Check again later; the task may still be processing.");
}
