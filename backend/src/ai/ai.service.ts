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

@Injectable()
export class AiService {
  private readonly openai?: OpenAI;
  private readonly model: string;

  constructor(
    config: ConfigService,
    private readonly rag: RagService
  ) {
    const apiKey = config.get<string>("OPENAI_API_KEY");
    this.model = config.get<string>("OPENAI_MODEL") ?? "gpt-4.1-mini";
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async chat(user: JwtUser, dto: AiChatDto) {
    const context = await this.rag.retrieve(dto.message, dto.module);
    const system = [
      "You are StadiumGPT AI for FIFA World Cup 2026 smart stadium operations.",
      modulePolicies[dto.module],
      "Return practical, safe, multilingual guidance. Cite operational context ids when useful.",
      "For medical, security, or evacuation emergencies, recommend immediate escalation to on-site command."
    ].join(" ");

    if (this.openai) {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `User: ${user.email}\nLanguage: ${dto.language ?? "en-US"}\nContext: ${JSON.stringify(context)}\nQuestion: ${dto.message}` }
        ]
      });

      return {
        module: dto.module,
        answer: completion.choices[0]?.message?.content ?? this.localAnswer(dto, context),
        confidence: 0.91,
        citations: context.map((item) => item.id),
        actions: this.actionsFor(dto.module)
      };
    }

    return {
      module: dto.module,
      answer: this.localAnswer(dto, context),
      confidence: 0.74,
      citations: context.map((item) => item.id),
      actions: this.actionsFor(dto.module)
    };
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
      voice: dto.voice ?? "alloy",
      input: dto.text,
      response_format: "mp3"
    });
    const buffer = Buffer.from(await audio.arrayBuffer());
    return {
      contentType: "audio/mpeg",
      audioBase64: buffer.toString("base64")
    };
  }

  private localAnswer(dto: AiChatDto, context: Array<{ id: string; text: string }>) {
    const contextText = context.map((item) => item.text).join(" ");
    const base = modulePolicies[dto.module] ?? modulePolicies.FAN;
    return `${base} Recommended action: ${contextText || "use the lowest-risk route, monitor crowd density, and escalate urgent incidents to stadium command."}`;
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
