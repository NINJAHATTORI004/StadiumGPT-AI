import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import type { JwtUser } from "../common/types/jwt-user";
import { AiChatDto } from "./dto/ai-chat.dto";
import { SpeakDto } from "./dto/speak.dto";
import { RagService } from "./rag.service";

const modulePolicies: Record<string, string> = {
  FAN: "Help fans with routes, gates, seats, parking, food, washrooms, tickets, lost-and-found, and match schedule. Keep instructions concise and accessible.",
  ORGANIZER: "Summarize operations, predict congestion, staffing, queues, transport, cleaning, security, medical, and sustainability impacts.",
  SECURITY: "Support incident triage, emergency recommendations, evacuation options, and risk summaries. Escalate life-safety decisions to command.",
  VOLUNTEER: "Help volunteers with assignments, translation, navigation, incident reporting, and escalation paths.",
  ACCESSIBILITY: "Prioritize WCAG-aligned, screen-reader friendly, step-free, wheelchair-accessible, voice-enabled guidance.",
  SUSTAINABILITY: "Analyze carbon, waste, energy, and transport impacts and recommend practical matchday actions.",
  MEDICAL: "Support medical request prioritization, route responders, and escalate urgent medical decisions to medical command."
};

export type AiProvider = "openai" | "zenmux";
type AiResponseProvider = AiProvider | "local";
type TtsVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

const ttsVoices: readonly TtsVoice[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

function isTtsVoice(voice?: string): voice is TtsVoice {
  return !!voice && ttsVoices.includes(voice as TtsVoice);
}

// Comprehensive stadium knowledge base for offline responses
const stadiumKnowledge: Record<string, Array<{ keywords: string[]; answer: string }>> = {
  FAN: [
    {
      keywords: ["accessible", "wheelchair", "step-free", "disability", "handicap"],
      answer: "Gate D has elevator access, tactile signage, accessible washrooms, and a step-free route to sections 220 through 240. For wheelchair seating, sections 220-240 on the lower concourse have dedicated wheelchair spaces with companion seating. Accessible parking is available in lots A and B with shuttle service to Gate D."
    },
    {
      keywords: ["parking", "park", "lot", "car"],
      answer: "Parking Lot B is closest to sections 220-240 via Gate D. Lot A serves the north entrance. Lot C is reserved for VIP and accessible parking. Follow real-time digital signage for available spots. Pre-booked parking is recommended for matchdays."
    },
    {
      keywords: ["route", "gate", "entrance", "way", "direction", "navigate"],
      answer: "From parking lot B, the most efficient route is through Gate D which connects directly to sections 220-240. Gate C is currently congested with an 18-minute queue. Gate A serves the north stands. Gate B is the main entrance for east sections. Use the stadium map on your device for turn-by-turn guidance."
    },
    {
      keywords: ["crowd", "congestion", "busy", "queue", "density", "wait", "line"],
      answer: "North Plaza is at 78% capacity with peak density expected 45 minutes before kickoff. Gate C has an 18-minute queue. Gate D has the shortest wait at approximately 5 minutes. Consider using Gate D or the east service corridor for faster entry. Overflow lanes are being activated at North Plaza."
    },
    {
      keywords: ["food", "concession", "water", "drink", "hungry", "eat", "vegetarian", "vegan", "snack"],
      answer: "Concession stands near sections 232 and 240 have the shortest queues. Vegetarian and vegan options are available at all main concession points, with dedicated plant-based stands at sections 120, 232, and 340. Pre-order via the StadiumGPT app for faster pickup. Hydration stations are located at every concourse level."
    },
    {
      keywords: ["medical", "emergency", "first aid", "doctor", "injured", "paramedic", "help", "sick"],
      answer: "First aid stations are located at every concourse level near sections 110, 230, and 340. For life-threatening emergencies, contact the nearest stadium staff immediately or call stadium command. Medical response teams are stationed at all major gate entrances. Defibrillators (AEDs) are available at all first aid stations."
    },
    {
      keywords: ["lost", "found", "missing", "child", "kid"],
      answer: "Report lost items or missing persons to the nearest information desk or guest services at the main concourse. Lost children should be escorted to guest services. The stadium has a digital lost-and-found system accessible via the app. Staff members are trained to assist with reunification."
    },
    {
      keywords: ["bathroom", "washroom", "restroom", "toilet", "lavatory"],
      answer: "Washrooms are located at every concourse level near sections 100, 200, and 300. Accessible/family washrooms are available near all gate entrances and at sections 120, 232, and 340. Baby changing facilities are available in all accessible washrooms."
    },
    {
      keywords: ["transit", "train", "shuttle", "bus", "transport", "home", "leave", "exit", "depart"],
      answer: "The transit hub is operational with rail and shuttle services. Rail departures peak after the final whistle. Post-match shuttle service runs for 90 minutes after the event. Track 3 has a departure at 22:44. Consider waiting 15-20 minutes after the match to avoid peak crowd congestion at the transit hub."
    },
    {
      keywords: ["ticket", "seat", "section", "row"],
      answer: "Your ticket includes your designated gate, section, row, and seat number. Use the stadium map to locate your section. Digital tickets can be accessed via the app. For ticket issues, visit the box office near Gate A or contact guest services."
    },
    {
      keywords: ["best seat", "best view", "view", "sightlines", "seating view"],
      answer: "For the best overall view, lower-bowl center sections around 100-140 offer balanced sightlines and proximity to the pitch. Upper-tier sections 200-230 are great for tactical overview. Avoid sections directly behind goalposts if you want the clearest field perspective."
    },
    {
      keywords: ["hello", "hi", "hey", "help", "what can you"],
      answer: "I can help with routes, gates, seats, parking, food, washrooms, tickets, lost-and-found, crowd conditions, accessibility, transportation, and match schedule. How can I assist you today?"
    }
  ],
  ORGANIZER: [
    {
      keywords: ["congestion", "crowd", "density", "overflow"],
      answer: "North Plaza is at 78% density and requires overflow lane activation. Gate C queue is at 18 minutes. Recommend dispatching 6 additional staff to North Plaza and opening the east service corridor as an alternative route."
    },
    {
      keywords: ["staff", "staffing", "volunteer", "dispatch", "personnel"],
      answer: "Current staffing levels are adequate but North Plaza needs 6 additional personnel. Gate D is underutilized at 28% capacity. Consider redeploying 2 staff from Gate D to Gate C. Medical teams are fully deployed."
    },
    {
      keywords: ["clean", "cleaning", "waste", "trash"],
      answer: "Waste collection is on schedule. Post-match cleaning crews are staged and ready. Recycling stations are operational at all concourse levels. Estimated waste volume is within normal matchday parameters."
    }
  ],
  SECURITY: [
    {
      keywords: ["incident", "threat", "risk", "danger", "suspicious"],
      answer: "All security checkpoints are operational. East service corridor is the preferred controlled egress route if Gate C density continues to rise. No active threats reported. Security personnel are deployed at all gate entrances."
    },
    {
      keywords: ["evacuation", "evacuate", "egress", "emergency exit"],
      answer: "East service corridor is the primary controlled egress route. Gate C should be avoided for evacuation due to current density. Follow stadium staff directions. Emergency exits are clearly marked at all concourse levels."
    }
  ],
  VOLUNTEER: [
    {
      keywords: ["task", "assignment", "duty", "job"],
      answer: "Current priority tasks: assist with Gate C crowd management, support accessible routing via Gate D, and prepare post-match transit guidance. Report to your zone supervisor for specific assignments."
    },
    {
      keywords: ["translate", "translation", "language", "multilingual"],
      answer: "Translation support is available in English, Spanish, French, Hindi, and Arabic. Use the StadiumGPT app for real-time translation. Direct fans with language needs to information desks."
    }
  ],
  ACCESSIBILITY: [
    {
      keywords: ["accessible", "wheelchair", "step-free", "disability"],
      answer: "Gate D has elevator access, tactile signage, accessible washrooms, and a step-free route to sections 220 through 240. Wheelchair seating is available in sections 220-240. Accessible parking is in lots A and B. Service animals are welcome."
    }
  ],
  SUSTAINABILITY: [
    {
      keywords: ["carbon", "emission", "environment", "green"],
      answer: "Fans choosing rail or shuttle over private vehicles reduce estimated emissions by 2.8 kg CO2e per passenger. Recycling stations are active. Energy load is being optimized. Recommend sending transit nudges to encourage sustainable transport."
    }
  ],
  MEDICAL: [
    {
      keywords: ["medical", "emergency", "first aid", "responder"],
      answer: "Medical teams are deployed at all major zones. Current median response time is 91 seconds. First aid stations are at sections 110, 230, and 340. For critical emergencies, escalate to medical command immediately."
    }
  ]
};

@Injectable()
export class AiService {
  private readonly openai?: OpenAI;
  private readonly openaiModel: string;
  private readonly zenmux?: OpenAI;
  private readonly zenmuxModel: string;

  constructor(
    config: ConfigService,
    private readonly rag: RagService
  ) {
    // OpenAI provider
    const openaiApiKey = config.get<string>("OPENAI_API_KEY");
    this.openaiModel = config.get<string>("OPENAI_MODEL") ?? "gpt-4.1-mini";
    if (openaiApiKey) {
      this.openai = new OpenAI({ apiKey: openaiApiKey });
    }

    // ZenMux provider uses the OpenAI SDK with a custom base URL.
    const zenmuxApiKey = config.get<string>("ZENMUX_API_KEY");
    this.zenmuxModel =
      config.get<string>("ZENMUX_MODEL") ?? "moonshotai/kimi-k3";
    if (zenmuxApiKey) {
      this.zenmux = new OpenAI({
        apiKey: zenmuxApiKey,
        baseURL:
          config.get<string>("ZENMUX_BASE_URL") ??
          "https://zenmux.ai/api/v1"
      });
    }
  }

  /** Resolve which OpenAI client to use based on the requested provider. */
  private resolveClient(
    provider?: AiProvider
  ): { client: OpenAI; model: string; provider: AiProvider } | undefined {
    if (provider === "zenmux") {
      if (!this.zenmux) return undefined;
      return { client: this.zenmux, model: this.zenmuxModel, provider: "zenmux" };
    }
    if (provider === "openai") {
      if (!this.openai) return undefined;
      return { client: this.openai, model: this.openaiModel, provider: "openai" };
    }
    if (this.openai) return { client: this.openai, model: this.openaiModel, provider: "openai" };
    if (this.zenmux) return { client: this.zenmux, model: this.zenmuxModel, provider: "zenmux" };
    return undefined;
  }

  async chat(user: JwtUser, dto: AiChatDto) {
    const context = await this.rag.retrieve(dto.message, dto.module);
    const system = [
      "You are StadiumGPT AI for FIFA World Cup 2026 smart stadium operations.",
      modulePolicies[dto.module],
      "Use only the provided context and stadium knowledge. Do not invent facts.",
      "If you are unsure, return a concise fallback answer from stadium knowledge.",
      "For medical, security, or evacuation emergencies, recommend immediate escalation to on-site command."
    ].join(" ");

    const requestedProvider = dto.provider as AiProvider | undefined;
    const resolved = requestedProvider ? this.resolveClient(requestedProvider) : undefined;

    if (!requestedProvider || !resolved) {
      return this.fallbackResponse(dto, context, requestedProvider ?? "local");
    }

    const { client, model, provider } = resolved;

    // Try direct HTTP fetch for ZenMux
    if (provider === "zenmux") {
      try {
        const response = await fetch(
          `https://zenmux.ai/api/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.ZENMUX_API_KEY}`
            },
            body: JSON.stringify({
              model,
              temperature: 0.2,
              messages: [
                { role: "system", content: system },
                {
                  role: "user",
                  content: `User: ${user.email}\nLanguage: ${dto.language ?? "en-US"}\nContext: ${JSON.stringify(context)}\nQuestion: ${dto.message}`
                }
              ]
            })
          }
        );

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const answer = data.choices?.[0]?.message?.content;
          if (answer) {
            return {
              module: dto.module,
              provider,
              answer,
              confidence: 0.95,
              citations: context.map((item) => item.id),
              actions: this.actionsFor(dto.module)
            };
          }
        }
      } catch {
        // Fall through to SDK attempt
      }

      // Try SDK as backup
      try {
        const completion = await client.chat.completions.create({
          model,
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `User: ${user.email}\nLanguage: ${dto.language ?? "en-US"}\nContext: ${JSON.stringify(context)}\nQuestion: ${dto.message}`
            }
          ]
        });

        const answer = completion.choices[0]?.message?.content;
        if (answer) {
          return {
            module: dto.module,
            provider,
            answer,
            confidence: 0.95,
            citations: context.map((item) => item.id),
            actions: this.actionsFor(dto.module)
          };
        }
      } catch {
        // Fall through to fallback
      }

      return this.fallbackResponse(dto, context, provider);
    }

    // For OpenAI, use the SDK directly
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `User: ${user.email}\nLanguage: ${dto.language ?? "en-US"}\nContext: ${JSON.stringify(context)}\nQuestion: ${dto.message}`
          }
        ]
      });

      return {
        module: dto.module,
        provider,
        answer: completion.choices[0]?.message?.content ?? this.localAnswer(dto, context),
        confidence: 0.91,
        citations: context.map((item) => item.id),
        actions: this.actionsFor(dto.module)
      };
    } catch {
      return this.fallbackResponse(dto, context, provider);
    }
  }

  async transcribe(file?: Express.Multer.File) {
    if (!file) {
      throw new ServiceUnavailableException("Audio file is required.");
    }
    if (!this.openai) {
      throw new ServiceUnavailableException("OPENAI_API_KEY is required for Whisper transcription.");
    }

    const upload = await toFile(file.buffer, file.originalname);
    const transcript = await this.openai.audio.transcriptions.create({
      model: "whisper-1",
      file: upload
    });
    return transcript;
  }

  async speak(dto: SpeakDto) {
    if (!this.openai) {
      throw new ServiceUnavailableException("OPENAI_API_KEY is required for text-to-speech.");
    }

    const audio = await this.openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: isTtsVoice(dto.voice) ? dto.voice : "alloy",
      input: dto.text,
      response_format: "mp3"
    });
    const buffer = Buffer.from(await audio.arrayBuffer());
    return {
      contentType: "audio/mpeg",
      audioBase64: buffer.toString("base64")
    };
  }

  private localAnswer(dto: AiChatDto, context: Array<{ id?: string; text?: string }>) {
    const question = dto.message.toLowerCase();
    const module = dto.module;
    const contextText = context
      .map((item) => item?.text ?? "")
      .filter(Boolean)
      .map((text) => text.trim())
      .filter((text, idx, arr) => arr.findIndex((x) => x === text) === idx)
      .slice(0, 2)
      .join("; ");

    const moduleKnowledge = stadiumKnowledge[module] ?? stadiumKnowledge.FAN;

    const scoreEntry = (entry: { keywords: string[]; answer: string }) =>
      entry.keywords.filter((kw) => question.includes(kw)).length;

    let bestModuleMatch: { keywords: string[]; answer: string } | undefined;
    let bestModuleScore = 0;
    for (const entry of moduleKnowledge) {
      const score = scoreEntry(entry);
      if (score > bestModuleScore) {
        bestModuleScore = score;
        bestModuleMatch = entry;
      }
    }

    let bestGlobalMatch: { keywords: string[]; answer: string } | undefined;
    let bestGlobalScore = 0;
    for (const [, entries] of Object.entries(stadiumKnowledge)) {
      for (const entry of entries) {
        const score = scoreEntry(entry);
        if (score > bestGlobalScore) {
          bestGlobalScore = score;
          bestGlobalMatch = entry;
        }
      }
    }

    if (bestModuleScore > 0 && bestModuleMatch) {
      return bestModuleMatch.answer;
    }
    if (bestGlobalScore > 0 && bestGlobalMatch && !bestModuleMatch) {
      return bestGlobalMatch.answer;
    }

    const followUp =
      module === "FAN"
        ? " Want me to check seat views, food stops, or accessibility routes?"
        : " Want me to suggest congestion, staffing, or incident priorities based on current data?";

    const core =
      module === "FAN"
        ? "I can help with routes, gates, seats, parking, food, washrooms, tickets, lost-and-found, crowds, accessibility, transit, and matchday logistics."
        : module === "ORGANIZER"
        ? "I can summarize operations, predict congestion, staffing, queues, transport, cleaning, security, medical, and sustainability impacts."
        : module === "SECURITY"
        ? "I can support incident triage, emergency recommendations, evacuation options, and risk summaries."
        : module === "VOLUNTEER"
        ? "I can help with assignments, translation, navigation, incident reporting, and escalation paths."
        : module === "ACCESSIBILITY"
        ? "I can provide step-free routes, accessible facilities, and voice-enabled guidance."
        : module === "SUSTAINABILITY"
        ? "I can analyze carbon, waste, energy, and transport impacts and recommend practical matchday actions."
        : "I can support medical request prioritization, responder routing, and escalation guidance.";

    return `${core}${followUp}`;
  }

  private fallbackResponse(
    dto: AiChatDto,
    context: Array<{ id: string; text: string }>,
    provider: AiResponseProvider
  ) {
    return {
      module: dto.module,
      provider,
      answer: this.localAnswer(dto, context),
      confidence: 0.74,
      citations: context.map((item) => item.id),
      actions: this.actionsFor(dto.module)
    };
  }

  private actionsFor(module: string) {
    const actions: Record<string, string[]> = {
      FAN: ["SHOW_ROUTE", "READ_ALOUD", "SAVE_OFFLINE"],
      ORGANIZER: ["DISPATCH_VOLUNTEERS", "OPEN_OVERFLOW_LANE", "SEND_NOTIFICATION"],
      SECURITY: ["ESCALATE_TO_COMMAND", "CHECK_EGRESS", "DISPATCH_SECURITY"],
      VOLUNTEER: ["ACCEPT_TASK", "TRANSLATE_NOTICE", "REPORT_INCIDENT"],
      ACCESSIBILITY: ["SHOW_STEP_FREE_ROUTE", "ENABLE_VOICE", "FIND_ACCESSIBLE_FACILITY"],
      SUSTAINABILITY: ["SEND_TRANSIT_NUDGE", "ADJUST_WASTE_STAFFING", "LOWER_ENERGY_LOAD"],
      MEDICAL: ["DISPATCH_MEDICAL_TEAM", "CLEAR_SERVICE_CORRIDOR", "ESCALATE_CRITICAL"]
    };
    return actions[module] ?? actions.FAN;
  }
}