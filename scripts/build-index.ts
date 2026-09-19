// Run once: npx tsx scripts/build-index.ts
// Builds the Moss knowledge base the Dispatch Copilot agent searches at
// call time. Re-run after editing DOCS below to push the new content.

import fs from "node:fs"
import path from "node:path"
import { MossClient, type DocumentInfo } from "@moss-js/moss"

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (!match) continue
    const key = match[1]
    let value = match[2] ?? ""
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvLocal()

const DOCS: DocumentInfo[] = [
  {
    id: "safety-live-line",
    text: "Live line protocol: a crew must not touch a downed or sparking line under any voltage. Set a 10 meter perimeter, notify dispatch, and wait for a certified line technician to confirm the line is de-energized.",
    metadata: { category: "safety" },
  },
  {
    id: "safety-confined-space",
    text: "Confined space entry, such as a vault or manhole, requires a gas reading below 10 percent LEL, a standby observer at the entrance, and a logged entry and exit time.",
    metadata: { category: "safety" },
  },
  {
    id: "safety-storm",
    text: "During a declared storm event, crews stop non-emergency work at wind speeds above 50 km/h and return to the nearest staging yard until dispatch clears the area.",
    metadata: { category: "safety" },
  },
  {
    id: "sla-p1",
    text: "Priority 1 outage, meaning no power to a hospital, water treatment plant, or more than 500 customers, must get a crew dispatched within 30 minutes of the ticket opening.",
    metadata: { category: "sla" },
  },
  {
    id: "sla-p2",
    text: "Priority 2 outage, a single-customer or small-cluster loss of service, has a 4 hour response target during business hours and 8 hours overnight.",
    metadata: { category: "sla" },
  },
  {
    id: "sla-escalation",
    text: "Escalate a ticket to the duty supervisor if a Priority 1 job passes 30 minutes without a crew en route, or if any job reopens twice for the same fault.",
    metadata: { category: "sla" },
  },
  {
    id: "equipment-recloser-reset",
    text: "To reset a tripped recloser, confirm the fault indicator light is off, then hold the manual reset lever for 3 seconds. If it trips again within 60 seconds, do not reset a third time; escalate to engineering.",
    metadata: { category: "equipment" },
  },
  {
    id: "equipment-transformer-code",
    text: "A transformer overheat alarm, code T-40, means oil temperature exceeded 95 degrees Celsius. Dispatch a technician to inspect cooling fans before any load is restored on that transformer.",
    metadata: { category: "equipment" },
  },
  {
    id: "equipment-meter-comm-loss",
    text: "A smart meter showing comm loss for over 24 hours should be flagged for a truck roll only if paired with a customer-reported outage. A lone comm loss is usually a network issue, not a power issue.",
    metadata: { category: "equipment" },
  },
  {
    id: "vehicle-bucket-truck",
    text: "Bucket trucks require a daily pre-trip inspection of the boom, outriggers, and insulation liner before the first job of the shift. Log the inspection in the vehicle checklist.",
    metadata: { category: "equipment" },
  },
  {
    id: "customer-callback",
    text: "After restoring power to a residential customer, the crew lead calls the original reporting number to confirm restoration before closing the ticket.",
    metadata: { category: "process" },
  },
  {
    id: "customer-medical-alert",
    text: "Accounts flagged with a medical life-support alert move to the front of the outage queue regardless of priority tier, and dispatch must call the customer directly within 15 minutes.",
    metadata: { category: "process" },
  },
  {
    id: "weather-heat",
    text: "Above 38 degrees Celsius ambient, crews take a mandatory 15 minute cooldown break every 2 hours and switch to reduced two-person lifting limits.",
    metadata: { category: "safety" },
  },
  {
    id: "process-mutual-aid",
    text: "If more than 15 crews are active on storm response at once, dispatch requests mutual aid crews from the regional utility pool through the duty supervisor, not through individual crew leads.",
    metadata: { category: "process" },
  },
  {
    id: "process-radio-channel",
    text: "Field crews use radio channel 4 for routine traffic and channel 1 for emergencies only. Dispatch monitors channel 1 continuously during active outages.",
    metadata: { category: "process" },
  },
]

async function main() {
  const projectId = process.env.MOSS_PROJECT_ID
  const projectKey = process.env.MOSS_PROJECT_KEY
  const indexName = process.env.MOSS_INDEX_NAME || "dispatch-kb"

  if (!projectId || !projectKey) {
    throw new Error(
      "Set MOSS_PROJECT_ID and MOSS_PROJECT_KEY in .env.local before running this script."
    )
  }

  const client = new MossClient(projectId, projectKey)

  try {
    await client.getIndex(indexName)
    console.log(`Index "${indexName}" already exists. Replacing it...`)
    await client.deleteIndex(indexName)
  } catch {
    // No existing index with this name, which is the normal first run.
  }

  console.log(`Creating index "${indexName}" with ${DOCS.length} documents...`)
  await client.createIndex(indexName, DOCS, { modelId: "moss-minilm" })
  console.log("Done. The Dispatch Copilot can now query this index.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
