"use client";

import { useMemo, useState } from "react";
import { Bot, Mic, Send, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { aiModules, assistantExamples } from "@/lib/data";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AiChatPanel({
  defaultModule = "FAN",
  compact = false
}: {
  defaultModule?: string;
  compact?: boolean;
}) {
  const [module, setModule] = useState(defaultModule);
  const [language, setLanguage] = useState("en-US");
  const [input, setInput] = useState("What is the best accessible route from parking lot B to section 232?");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I can help with routes, crowds, incidents, accessibility, transportation, sustainability, and matchday operations."
    }
  ]);

  const examples = useMemo(() => assistantExamples[module] ?? assistantExamples.FAN, [module]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}`;
    console.debug("AI chat request", { apiUrl, module, language, message: trimmed });

    try {
      const response = await fetch(`/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, language, message: trimmed })
      });

      const status = response.status;
      const text = await response.text();
      console.debug("AI chat response", { status, body: text });

      if (!response.ok) {
        throw new Error(`AI request failed: ${status}`);
      }

      const data = JSON.parse(text) as { answer: string };
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: data.answer }
      ]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, I couldn't reach the AI service. Try again." }
      ]);
    }
  }

  function startVoice() {
    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  }

  function speakLatest() {
    const latest = [...messages].reverse().find((message) => message.role === "assistant");
    if (!latest || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(latest.content);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" aria-hidden="true" />
            StadiumGPT Assistant
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Role-aware multilingual decision support for stadium operations.
          </p>
        </div>
        <Badge>{module}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Module
            <select
              className="h-10 rounded-lg border border-border bg-background px-3"
              value={module}
              onChange={(event) => setModule(event.target.value)}
            >
              {aiModules.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Language
            <select
              className="h-10 rounded-lg border border-border bg-background px-3"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en-US">English</option>
              <option value="es-US">Spanish</option>
              <option value="fr-CA">French</option>
              <option value="hi-IN">Hindi</option>
              <option value="ar">Arabic</option>
            </select>
          </label>
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <Button key={example} variant="secondary" size="sm" onClick={() => setInput(example)}>
                {example}
              </Button>
            ))}
          </div>
        )}

        <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3" aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg p-3 text-sm leading-6 ${
                message.role === "assistant"
                  ? "bg-card text-card-foreground"
                  : "ml-auto max-w-[88%] bg-primary text-primary-foreground"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <Textarea
            aria-label="Ask StadiumGPT"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask for a route, queue prediction, incident summary, translation, or sustainability recommendation."
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => sendMessage()}>
              <Send aria-hidden="true" /> Send
            </Button>
            <Button variant="secondary" onClick={startVoice}>
              {listening ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />} Voice input
            </Button>
            <Button variant="outline" onClick={speakLatest}>
              <Volume2 aria-hidden="true" /> Voice output
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

