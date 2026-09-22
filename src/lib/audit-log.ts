// ponytail: stdout is the audit log. Vercel/most hosts capture structured
// stdout as queryable logs already — swap for a DB table if we need
// cross-request queries (e.g. "audit trail per tenant") later.
export type ToolCallLog = {
  tenantId: string
  query: string
  matchedIds: string[]
  latencyMs: number
  accepted: boolean
  blockReason?: string
}

export function logToolCall(entry: ToolCallLog) {
  console.log(
    JSON.stringify({ event: "tool_call", at: new Date().toISOString(), ...entry })
  )
}
