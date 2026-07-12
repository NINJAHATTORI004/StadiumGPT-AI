import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [metrics, carbon, incidents] = await Promise.all([
      this.prisma.analyticsMetric.findMany({ orderBy: { recordedAt: "desc" }, take: 20 }),
      this.prisma.carbonTracking.findMany({ orderBy: { recordedAt: "desc" }, take: 10 }),
      this.prisma.securityIncident.groupBy({
        by: ["severity"],
        _count: { severity: true }
      })
    ]);

    return {
      generatedAt: new Date().toISOString(),
      metrics,
      carbon,
      incidents
    };
  }
}

