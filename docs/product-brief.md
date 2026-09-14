# Product Brief

## Vision

Voice-Agent gives people a fast, natural way to access the information needed
to do time-sensitive work. It connects a live conversation to the right
operational context instead of making the user search for it manually.

## Core loop

1. The user speaks naturally about the active task.
2. The system identifies intent, user context, and relevant entities.
3. Moss retrieves the smallest useful set of approved context.
4. The agent responds with a concise answer or asks for the missing detail.
5. The interaction records useful feedback for quality and observability.

## Experience principles

- **Immediate:** Preserve natural turn-taking and minimize dead air.
- **Grounded:** Prefer a short answer supported by relevant context.
- **Focused:** Keep the user in the task instead of sending them through menus.
- **Honest:** State uncertainty and hand off when the agent lacks authority or
  context.
- **Observable:** Make latency, retrieval quality, and failures measurable.

## Initial workflow areas

### Field operations

Surface job instructions, equipment procedures, location context, and escalation
paths while a worker is in motion.

### Healthcare operations

Provide approved workflow guidance and case context while respecting access
controls and the limits of automated assistance.

### Dispatch

Help coordinators retrieve incident details, status, and next actions while
multiple events change in parallel.

### Customer support

Give agents grounded answers and relevant account context without interrupting
the customer conversation.

## Technical direction

The application is built with Next.js, React, and TypeScript. The runtime will
need a streaming voice layer, a retrieval service, source and permission
controls, and instrumentation for end-to-end latency.

Moss is the planned retrieval layer. Its sub-10ms target is a product constraint
for the retrieval step, not a claim that the current scaffold already meets it.

## Current status

The repository currently provides the web application scaffold and shared UI
foundations. The next slices should establish the conversation surface, define
the agent and retrieval contracts, and add a measured prototype for one
workflow before expanding to other domains.
