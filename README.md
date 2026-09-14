# Voice-Agent

Real-time voice and conversational AI for work that cannot wait.

Voice-Agent is a product workspace for building voice agents that understand
context and respond instantly. The first target users are field workers,
healthcare teams, dispatchers, and customer support agents who need information
while their attention stays on the work in front of them.

## Problem

Most voice workflows force people to choose between slow answers, fragmented
tools, and inaccurate context. A field worker should not stop to search a
knowledge base. A dispatcher should not repeat a case summary. A care team
should not wait for a screen to load before acting.

Voice-Agent explores a low-latency interaction model: listen, retrieve the
right context, and respond in the same flow. The planned retrieval layer,
Moss, targets sub-10ms context retrieval for time-sensitive agent interactions.

Read the full [problem statement](docs/problem-statement.md) for users,
constraints, and success criteria.

## Product direction

- Natural voice conversations with fast turn-taking
- Context retrieval that uses the current task, user, and organization
- Clear answers grounded in approved operational knowledge
- Workflows for field operations, healthcare, dispatch, and support
- Observable latency, retrieval quality, and response confidence

The current repository contains the Next.js application scaffold and shared UI
foundations. Product workflows and the real-time agent runtime are the next
implementation areas.

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the available checks with:

```bash
npm run lint
npm run build
```

## Documentation

- [Problem statement](docs/problem-statement.md)
- [Product brief](docs/product-brief.md)

## Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Base UI and Lucide icons

## Contributing

Keep changes focused on the voice-agent workflow. Document new product
assumptions, external services, and latency tradeoffs when they affect the
runtime or user experience.
