import { NextResponse } from "next/server"

import { logToolCall } from "@/lib/audit-log"
import { notifyEscalation } from "@/lib/escalate"
import { checkGuardrail } from "@/lib/guardrail"
import { searchKnowledgeBase } from "@/lib/moss"
import { DEFAULT_TENANT_ID, getTenantConfig } from "@/lib/tenant-config"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const query = body?.query
  const tenantId =
    typeof body?.tenantId === "string" ? body.tenantId : DEFAULT_TENANT_ID

  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const guardrail = checkGuardrail(query)
  if (!guardrail.allowed) {
    logToolCall({
      tenantId,
      query,
      matchedIds: [],
      latencyMs: 0,
      accepted: false,
      blockReason: guardrail.reason,
    })
    await notifyEscalation(`Guardrail blocked (${guardrail.reason})`, query)
    return NextResponse.json(
      { error: "Query blocked by safety guardrail", reason: guardrail.reason },
      { status: 403 }
    )
  }

  const { indexName } = getTenantConfig(tenantId)
  const start = performance.now()
  try {
    const docs = await searchKnowledgeBase(query, indexName)
    const latencyMs = Math.round(performance.now() - start)
    const accepted = docs.length > 0

    logToolCall({
      tenantId,
      query,
      matchedIds: docs.map((d) => d.id),
      latencyMs,
      accepted,
    })
    if (!accepted) {
      await notifyEscalation("No knowledge base match", query)
    }

    return NextResponse.json({ docs, latencyMs })
  } catch (error) {
    logToolCall({
      tenantId,
      query,
      matchedIds: [],
      latencyMs: Math.round(performance.now() - start),
      accepted: false,
      blockReason: "search_error",
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "search failed" },
      { status: 500 }
    )
  }
}
