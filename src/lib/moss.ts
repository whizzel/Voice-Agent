import { MossClient } from "@moss-js/moss"

let client: MossClient | null = null
const loadedIndexes = new Map<string, Promise<unknown>>()

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
  }
  return client
}

function ensureIndexLoaded(c: MossClient, indexName: string) {
  let ready = loadedIndexes.get(indexName)
  if (!ready) {
    ready = c.loadIndex(indexName)
    loadedIndexes.set(indexName, ready)
  }
  return ready
}

export type MossMatch = {
  id: string
  text: string
  score: number
}

export async function searchKnowledgeBase(
  query: string,
  indexName: string,
  topK = 3
): Promise<MossMatch[]> {
  const c = getClient()
  await ensureIndexLoaded(c, indexName)
  const results = await c.query(indexName, query, { topK })
  return results.docs.map((doc) => ({
    id: doc.id,
    text: doc.text,
    score: doc.score,
  }))
}
