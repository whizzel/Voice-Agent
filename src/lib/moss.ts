import { MossClient } from "@moss-js/moss"

export const MOSS_INDEX_NAME = process.env.MOSS_INDEX_NAME || "dispatch-kb"

let client: MossClient | null = null
let indexReady: Promise<unknown> | null = null

function getClient() {
  if (!client) {
    const projectId = process.env.MOSS_PROJECT_ID
    const projectKey = process.env.MOSS_PROJECT_KEY
    if (!projectId || !projectKey) {
      throw new Error(
        "Set MOSS_PROJECT_ID and MOSS_PROJECT_KEY in .env.local"
      )
    }
    client = new MossClient(projectId, projectKey)
    indexReady = client.loadIndex(MOSS_INDEX_NAME)
  }
  return client
}

export type MossMatch = {
  id: string
  text: string
  score: number
}

export async function searchKnowledgeBase(
  query: string,
  topK = 3
): Promise<MossMatch[]> {
  const c = getClient()
  await indexReady
  const results = await c.query(MOSS_INDEX_NAME, query, { topK })
  return results.docs.map((doc) => ({
    id: doc.id,
    text: doc.text,
    score: doc.score,
  }))
}
