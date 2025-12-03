interface AIRequestPayload {
  message: string;
  topic?: string;
}

export async function getAIResponse({ message, topic }: AIRequestPayload): Promise<string> {
  const apiBaseUrl = import.meta.env.VITE_AI_PROXY_URL || "http://localhost:3001";
  const response = await fetch(`${apiBaseUrl}/api/ai-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, topic })
  });

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch {
      // ignore body read errors
    }
    throw new Error(
      `AI backend error (${response.status}): ${errorText || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data || typeof data.answer !== "string") {
    const fallbackMessage =
      (typeof data?.error === "string" && data.error) ||
      "AI backend did not return a valid answer.";
    throw new Error(fallbackMessage);
  }

  return data.answer;
}
