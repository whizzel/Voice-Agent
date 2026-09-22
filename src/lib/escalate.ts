const WEBHOOK_URL = process.env.ESCALATION_WEBHOOK_URL

export async function notifyEscalation(reason: string, query: string) {
  if (!WEBHOOK_URL) {
    console.warn(JSON.stringify({ event: "escalation", reason, query }))
    return
  }
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Dispatch Copilot escalation: ${reason}\nQuery: "${query}"` }),
    })
  } catch {
    console.error(JSON.stringify({ event: "escalation_webhook_failed", reason, query }))
  }
}
