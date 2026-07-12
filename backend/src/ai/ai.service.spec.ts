import { RoleName } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";
import { RagService } from "./rag.service";

describe("AiService", () => {
  it("returns a role-aware local answer when no OpenAI key is configured", async () => {
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const rag = new RagService(config);
    const service = new AiService(config, rag);

    const result = await service.chat(
      { sub: "user-1", email: "organizer@stadiumgpt.ai", name: "Organizer", roles: [RoleName.ORGANIZER] },
      { module: "ORGANIZER", message: "What should we do about Gate C?", language: "en-US" }
    );

    expect(result.module).toBe("ORGANIZER");
    expect(result.answer).toContain("Summarize operations");
    expect(result.citations.length).toBeGreaterThan(0);
  });
});
