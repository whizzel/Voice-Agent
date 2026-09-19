import { NextResponse } from "next/server"

import { searchKnowledgeBase } from "@/lib/moss"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const query = body?.query

  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const start = performance.now()
  try {
    const docs = await searchKnowledgeBase(query)
    const latencyMs = Math.round(performance.now() - start)
    return NextResponse.json({ docs, latencyMs })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "search failed" },
      { status: 500 }
    )
  }
}
