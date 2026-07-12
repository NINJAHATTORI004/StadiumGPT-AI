import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIEmbeddings } from "@langchain/openai";

const knowledgeBase = [
  {
    id: "route:accessible_gate_d",
    role: "ACCESSIBILITY",
    text: "Gate D has elevator access, tactile signage, accessible washrooms, and a step-free route to sections 220 through 240."
  },
  {
    id: "crowd_sensor:north_plaza",
    role: "ORGANIZER",
    text: "North Plaza typically peaks 45 minutes before kickoff and needs overflow lane activation above 72 percent density."
  },
  {
    id: "security:evac_east",
    role: "SECURITY",
    text: "East service corridor is the preferred controlled egress route when Gate C crowd density is elevated."
  },
  {
    id: "sustainability:transit_nudge",
    role: "SUSTAINABILITY",
    text: "Fans choosing rail or shuttle over private vehicles reduce estimated emissions by 2.8 kg CO2e per passenger."
  }
];

@Injectable()
export class RagService {
  private readonly embeddings?: OpenAIEmbeddings;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>("OPENAI_API_KEY");
    if (apiKey) {
      this.embeddings = new OpenAIEmbeddings({
        apiKey,
        model: config.get<string>("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small"
      });
    }
  }

  async retrieve(query: string, role: string) {
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    const ranked = knowledgeBase
      .map((item) => ({
        ...item,
        score:
          (item.role === role ? 3 : 0) +
          terms.filter((term) => item.text.toLowerCase().includes(term)).length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (this.embeddings) {
      await this.embeddings.embedQuery(query);
    }

    return ranked.map(({ id, text, role: itemRole }) => ({ id, text, role: itemRole }));
  }
}

