# PRD — Dispatch Copilot (Hackathon MVP)

## Summary

Dispatch Copilot is a voice agent for field-service dispatch. A dispatcher
speaks a question. The agent answers in voice, in under two seconds, using
facts pulled from an approved knowledge base. Every answer shows its source
and its retrieval time.

This is the first workflow slice named in the [product brief](product-brief.md).
It proves the core loop end to end: voice in, grounded retrieval, voice out.

## Why dispatch

Dispatch fits the problem statement best for a live demo. The domain has
clear procedures, an urgent tone, and answers that are easy for judges to
verify against the shown source.

## Users

Dispatch coordinators who need a fast, correct answer while coordinating
incidents, crews, and equipment. See [problem statement](problem-statement.md)
for the full user set.

## Core loop

1. The dispatcher taps the orb and speaks.
2. ElevenLabs Conversational AI transcribes speech and starts a reply.
3. When the question needs a fact, the agent calls a tool named
   `search_knowledge_base`.
4. The browser runs that tool call. It queries Moss and returns the top
   matches with a latency number.
5. The agent speaks a grounded answer. The screen shows the same source text
   and the query time.

## What is real vs. simulated

| Part | Status |
| --- | --- |
| Speech in, speech out, turn-taking | Real. ElevenLabs Conversational AI. |
| Knowledge retrieval | Real. Moss cloud index, queried live per turn. |
| Retrieval latency display | Real. Measured client-side, in milliseconds. |
| Knowledge base content | Sample. 15 short dispatch procedures, not a live ops system. |
| Access control, audit trail | Out of scope for this slice. |

## Success criteria for the demo

- A spoken question about a seeded procedure gets a correct spoken answer.
- The source card matches what the agent said.
- The retrieval latency badge shows a real, low number, not a placeholder.
- The agent says it does not know when a question falls outside the seeded
  knowledge base, instead of guessing.

## Non-goals for this slice

- No login, no multi-tenant data, no real dispatch system integration.
- No second workflow (healthcare, support). One workflow, proven well, beats
  four workflows proven badly in 12 hours.
- No design-system overhaul. Reuse ElevenLabs UI components as-is.

## Stack

- Next.js 16, React 19, TypeScript (existing scaffold).
- ElevenLabs UI components: orb, message, response, conversation,
  shimmering-text.
- `@elevenlabs/react` for the live voice session.
- `@moss-js/moss` for the knowledge base, called from a Next.js route so the
  project key stays server-side.

## Manual setup required (not buildable by an agent)

1. Moss: create a project API key and note the project ID.
2. ElevenLabs: create a Conversational AI agent, add a client tool named
   `search_knowledge_base` with one required string parameter `query`, and
   copy the agent ID.

Both steps happen once, in each dashboard, and take a few minutes.
