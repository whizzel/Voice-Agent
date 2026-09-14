# Problem Statement

## Context

Field workers, healthcare teams, dispatchers, and support agents often work with
one hand busy and little time to search. Their answers live across procedures,
case systems, schedules, and internal knowledge bases.

Existing workflows break the conversation. People must stop to type, switch
between tools, repeat context, or wait for a response. These delays create
avoidable friction in routine work and increase the risk of acting on stale or
incomplete information.

## Users

- **Field workers** need instructions and job context while moving between
  locations or operating equipment.
- **Healthcare teams** need fast access to approved guidance without losing the
  patient or case context.
- **Dispatchers** need concise answers while coordinating changing incidents,
  people, and resources.
- **Customer support teams** need consistent answers while keeping the caller
  engaged.

## Core problem

How might we give a worker a trustworthy answer in the moment, without forcing
that worker to leave the conversation or manually reconstruct context?

The product must combine voice input, relevant retrieval, and a clear spoken
response into one interaction. It must feel immediate while remaining grounded
in the organization's approved knowledge.

## Constraints

- Response latency must support natural turn-taking.
- Retrieved context must be relevant to the active task and user.
- Answers must be traceable to approved sources where the workflow requires it.
- The system must handle interruptions, uncertainty, and missing context clearly.
- Sensitive healthcare and operational data must receive appropriate access
  controls and handling.
- The interface must work when users have limited attention or limited screen
  access.

## Success criteria

We will measure progress with:

- Time from the end of a user turn to the first useful response
- Context retrieval latency, with Moss targeting sub-10ms retrieval
- Retrieval relevance for the active task
- Rate of answers accepted without a follow-up search
- Successful handoff when the agent lacks enough context
- User trust, measured through correction and escalation rates

## Non-goals

The first release is not a general-purpose voice assistant, a replacement for
professional judgment, or an unreviewed source of medical advice. It should
support decisions with grounded information and make uncertainty visible.
