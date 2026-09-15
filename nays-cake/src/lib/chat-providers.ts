export function chatProviders() {
  return [
    { name: "Gemini", key: process.env.CHAT_GEMINI_API_KEY, model: process.env.CHAT_GEMINI_MODEL || "gemini-2.5-flash", url: "https://generativelanguage.googleapis.com/v1beta/models/" },
    { name: "Groq", key: process.env.CHAT_GROQ_API_KEY, model: process.env.CHAT_GROQ_MODEL || "llama-3.3-70b-versatile", url: "https://api.groq.com/openai/v1/chat/completions" },
    { name: "OpenRouter", key: process.env.CHAT_OPENROUTER_API_KEY, model: process.env.CHAT_OPENROUTER_MODEL || "openrouter/free", url: "https://openrouter.ai/api/v1/chat/completions" },
  ].filter(p => !!p.key?.trim());
}
type Provider = ReturnType<typeof chatProviders>[number];
export async function providerSelection(provider: Provider, prompt: string, history: { role: string; content: string }[], timeout: number) {
  if (!/^[a-zA-Z0-9._/:-]{1,200}$/.test(provider.model)) throw new Error("Invalid model");
  const gemini = provider.name === "Gemini";
  if (gemini && provider.model.includes("/")) throw new Error("Invalid Gemini model");
  const response = await fetch(gemini ? provider.url + provider.model + ":generateContent" : provider.url, {
    method: "POST", signal: AbortSignal.timeout(timeout), cache: "no-store",
    headers: gemini
      ? { "Content-Type": "application/json", "x-goog-api-key": provider.key! }
      : { "Content-Type": "application/json", Authorization: "Bearer " + provider.key! },
    body: JSON.stringify(gemini ? {
      systemInstruction: { parts: [{ text: prompt }] },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(history.slice(-6)) }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512, responseMimeType: "application/json" },
    } : {
      model: provider.model, temperature: 0.1, max_tokens: 512,
      messages: [{ role: "system", content: prompt }, { role: "user", content: JSON.stringify(history.slice(-6)) }],
      response_format: { type: "json_object" },
    }),
  });
  if (!response.ok) throw new Error("Provider request failed (" + response.status + ")");
  const body = await response.json();
  let raw: string;
  if (gemini) {
    const candidate = body.candidates?.[0];
    if (candidate?.finishReason !== "STOP") throw new Error("Incomplete response");
    raw = candidate.content?.parts?.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text || "").join("") || "";
  } else {
    const choice = body.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") throw new Error("Incomplete response");
    raw = choice.message.content;
  }
  return JSON.parse(raw);
}
