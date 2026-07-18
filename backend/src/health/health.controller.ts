import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@ApiTags("health")
@Controller("health")
export class HealthController {
  private readonly redis?: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    const redisUrl = this.config.get<string>("REDIS_URL");
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        retryStrategy: () => null
      });
    }
  }

  @Get()
  async health() {
    const checks: Record<string, string> = {};

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = "connected";
    } catch {
      checks.database = "disconnected";
    }

    // Redis check
    if (this.redis) {
      try {
        await this.redis.connect();
        const pong = await this.redis.ping();
        checks.redis = pong === "PONG" ? "connected" : "error";
        await this.redis.disconnect();
      } catch {
        checks.redis = "disconnected";
      }
    } else {
      checks.redis = "not_configured";
    }

    const allOk = Object.values(checks).every((v) => v === "connected" || v === "not_configured");

    return {
      status: allOk ? "ok" : "degraded",
      service: "stadiumgpt-api",
      timestamp: new Date().toISOString(),
      checks
    };
  }
}