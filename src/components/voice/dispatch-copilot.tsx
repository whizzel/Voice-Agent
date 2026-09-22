"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ConversationProvider,
  useConversation,
  useConversationClientTool,
} from "@elevenlabs/react"
import { AnimatePresence, motion } from "motion/react"
import {
  Loader2Icon,
  MessageSquareTextIcon,
  MicIcon,
  MicOffIcon,
  PhoneIcon,
  PhoneOffIcon,
  RadioTowerIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Conversation,
  ConversationContent,
} from "@/components/voice/conversation"
import { Message, MessageContent } from "@/components/voice/message"
import { Orb } from "@/components/voice/orb"
import { Response } from "@/components/voice/response"
import { ShimmeringText } from "@/components/voice/shimmering-text"

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

type ChatMessage = { role: "user" | "assistant"; content: string }
type KbMatch = { id: string; text: string; score: number }

export function DispatchCopilotPage() {
  return (
    <ConversationProvider>
      <DispatchCopilot />
    </ConversationProvider>
  )
}

function DispatchCopilot() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sources, setSources] = useState<KbMatch[]>([])
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // The WebRTC transport (livekit-client) logs its normal end-of-call
  // signal teardown as console.error, which Next's dev overlay then shows
  // as a false-alarm "Console Error". Silence just that internal logger.
  useEffect(() => {
    import("livekit-client").then(({ setLogLevel, LogLevel, LoggerNames }) => {
      setLogLevel(LogLevel.silent, LoggerNames.Signal)
    })
  }, [])

  useConversationClientTool("search_knowledge_base", async (params) => {
    const query = String(params.query ?? "")
    const start = performance.now()
    try {
      const res = await fetch("/api/moss/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) {
        return res.status === 403
          ? "That question was blocked by a safety check."
          : "No relevant entries found."
      }

      const docs: KbMatch[] = data.docs ?? []
      setSources(docs)
      setLatencyMs(data.latencyMs ?? Math.round(performance.now() - start))

      if (!docs.length) return "No relevant entries found."
      return docs.map((doc) => `- ${doc.text}`).join("\n")
    } catch {
      return "Knowledge base search failed."
    }
  })

  const {
    status,
    isSpeaking,
    isMuted,
    setMuted,
    startSession,
    endSession,
    getInputVolume,
    getOutputVolume,
  } = useConversation({
    onConnect: () => {
      setMessages([])
      setSources([])
      setLatencyMs(null)
      setErrorMessage(null)
    },
    onMessage: (message) => {
      if (message.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: message.source === "user" ? "user" : "assistant",
            content: message.message,
          },
        ])
      }
    },
    onError: () => {
      setErrorMessage("Connection error. Try again.")
    },
  })

  const isCallActive = status === "connected"
  const isConnecting = status === "connecting"
  const hasTranscript = messages.length > 0

  const scaledInputVolume = useCallback(() => {
    try {
      return Math.min(1, Math.pow(getInputVolume() ?? 0, 0.5) * 2.5)
    } catch {
      return 0
    }
  }, [getInputVolume])

  const scaledOutputVolume = useCallback(() => {
    try {
      return Math.min(1, Math.pow(getOutputVolume() ?? 0, 0.5) * 2.5)
    } catch {
      return 0
    }
  }, [getOutputVolume])

  const handleCall = useCallback(async () => {
    if (isCallActive) {
      endSession()
      return
    }
    if (!AGENT_ID) {
      setErrorMessage("Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local.")
      return
    }
    try {
      setErrorMessage(null)
      await navigator.mediaDevices.getUserMedia({ audio: true })
      startSession({ agentId: AGENT_ID, connectionType: "webrtc" })
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage("Enable microphone access in your browser.")
      } else {
        setErrorMessage("Could not start the call.")
      }
    }
  }, [isCallActive, endSession, startSession])

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <RadioTowerIcon className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Dispatch Copilot
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              isCallActive
                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
                : "border-border text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isCallActive ? "bg-blue-500" : "bg-muted-foreground/50"
              )}
            />
            {isCallActive ? "Live" : "Offline"}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-12 px-6 py-16">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="border-border bg-card text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Field Dispatch · Voice Agent
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Ask dispatch anything. Out loud.
          </h1>
          <p className="text-muted-foreground max-w-md text-balance">
            Every answer is grounded in the knowledge base entry it came
            from, with the retrieval time shown right next to it.
          </p>
        </header>

        <div className="flex flex-col items-center gap-6">
          <div className="relative size-56">
            <div
              className={cn(
                "absolute inset-0 -z-10 rounded-full blur-3xl transition-opacity duration-700",
                isCallActive ? "bg-blue-400/40 opacity-100" : "bg-blue-300/25 opacity-60"
              )}
            />
            <div
              className={cn(
                "h-full w-full rounded-full p-1.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.08)] transition-shadow duration-500 dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]",
                isCallActive ? "bg-blue-100 dark:bg-blue-950/40" : "bg-muted"
              )}
            >
              <div className="bg-background h-full w-full overflow-hidden rounded-full">
                <Orb
                  className="h-full w-full"
                  getInputVolume={scaledInputVolume}
                  getOutputVolume={scaledOutputVolume}
                />
              </div>
            </div>
          </div>

          <div className="flex min-h-6 items-center gap-2 text-sm">
            {errorMessage ? (
              <span className="text-destructive text-center">
                {errorMessage}
              </span>
            ) : isConnecting ? (
              <ShimmeringText text="Connecting…" />
            ) : isCallActive ? (
              <span className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
                </span>
                {isSpeaking ? "Speaking" : "Listening"}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Tap to start a call
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCall}
              disabled={isConnecting}
              variant={isCallActive ? "secondary" : "default"}
              className={cn(
                "gap-2 rounded-full shadow-sm transition-all",
                isCallActive ? "size-14 p-0" : "h-12 px-6"
              )}
            >
              {isConnecting ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : isCallActive ? (
                <PhoneOffIcon className="size-5" />
              ) : (
                <>
                  <PhoneIcon className="size-4" />
                  Start call
                </>
              )}
            </Button>
            {isCallActive && (
              <Button
                onClick={() => setMuted(!isMuted)}
                size="icon"
                variant="outline"
                className="size-11 rounded-full"
              >
                {isMuted ? (
                  <MicOffIcon className="size-4" />
                ) : (
                  <MicIcon className="size-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div
          className={cn(
            "grid w-full gap-4 overflow-hidden transition-all duration-500 ease-out sm:grid-cols-[1fr_240px]",
            hasTranscript
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div className="border-border bg-card flex h-72 flex-col overflow-hidden rounded-2xl border shadow-sm">
              <div className="border-border flex items-center gap-1.5 border-b px-4 py-2.5 text-xs font-medium">
                <MessageSquareTextIcon className="text-muted-foreground size-3.5" />
                Transcript
              </div>
              <Conversation className="flex-1">
                <ConversationContent>
                  <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <Message from={message.role}>
                          <MessageContent>
                            <Response>{message.content}</Response>
                          </MessageContent>
                        </Message>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ConversationContent>
              </Conversation>
            </div>
          </div>

          <div className="min-h-0">
            <div className="border-border bg-card flex h-72 flex-col overflow-hidden rounded-2xl border shadow-sm">
              <div className="border-border flex items-center justify-between border-b px-4 py-2.5 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <SearchIcon className="text-muted-foreground size-3.5" />
                  Knowledge lookup
                </span>
                {latencyMs !== null && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    {latencyMs}ms
                  </span>
                )}
              </div>
              <ul className="space-y-2 overflow-y-auto p-3">
                {sources.map((source) => (
                  <li
                    key={source.id}
                    className="bg-muted rounded-lg p-2.5 text-xs leading-relaxed"
                  >
                    <p className="line-clamp-3">{source.text}</p>
                    <span className="text-muted-foreground">
                      {Math.round(source.score * 100)}% match
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-border/60 border-t px-6 py-6">
        <p className="text-muted-foreground mx-auto max-w-3xl text-center text-xs">
          Voice by ElevenLabs Conversational AI · Retrieval by Moss
        </p>
      </footer>
    </div>
  )
}
