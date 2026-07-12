import { Injectable } from "@nestjs/common";
import { IncidentStatus, RequestStatus, Severity } from "@prisma/client";
import { PaginationDto } from "../common/dto/pagination.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { CreateMedicalRequestDto } from "./dto/create-medical-request.dto";
import { FanContextQueryDto } from "./dto/fan-context-query.dto";

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(role: string) {
    const [openIncidents, openMedical, latestCrowd, unreadNotifications] = await Promise.all([
      this.prisma.securityIncident.count({ where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.TRIAGED] } } }),
      this.prisma.medicalRequest.count({ where: { status: { in: [RequestStatus.OPEN, RequestStatus.ASSIGNED] } } }),
      this.prisma.crowdReading.findMany({
        take: 8,
        orderBy: { recordedAt: "desc" },
        include: { sensor: true }
      }),
      this.prisma.notification.count({ where: { readAt: null } })
    ]);

    return {
      role,
      generatedAt: new Date().toISOString(),
      metrics: {
        openIncidents,
        openMedical,
        unreadNotifications,
        averageQueueMinutes:
          latestCrowd.length === 0
            ? 0
            : Math.round(latestCrowd.reduce((sum, item) => sum + item.queueMinutes, 0) / latestCrowd.length)
      },
      crowd: latestCrowd.map((reading) => ({
        zone: reading.sensor.zone,
        density: reading.density,
        queueMinutes: reading.queueMinutes,
        risk: reading.risk,
        recordedAt: reading.recordedAt
      }))
    };
  }

  async fanContext(query: FanContextQueryDto) {
    const [gates, vendors, routes, parkingLots] = await Promise.all([
      this.prisma.gate.findMany({ orderBy: [{ queueMinute: "asc" }], take: 5 }),
      this.prisma.foodVendor.findMany({ orderBy: [{ waitMinutes: "asc" }], take: 5 }),
      this.prisma.route.findMany({ where: { accessible: true }, include: { steps: { orderBy: { sequence: "asc" } } }, take: 5 }),
      this.prisma.parkingLot.findMany({ orderBy: [{ accessible: "desc" }, { capacity: "desc" }], take: 5 })
    ]);

    return {
      query,
      recommendedGate: gates[0] ?? null,
      food: vendors,
      accessibleRoutes: routes,
      parking: parkingLots,
      guidance: "Use the lowest-queue accessible gate, keep service corridors clear, and follow staff instructions during any emergency mode."
    };
  }

  async crowd(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [items, total] = await Promise.all([
      this.prisma.crowdReading.findMany({
        skip,
        take: pagination.limit,
        orderBy: { recordedAt: "desc" },
        include: { sensor: true }
      }),
      this.prisma.crowdReading.count()
    ]);

    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async securityIncidents(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [items, total] = await Promise.all([
      this.prisma.securityIncident.findMany({
        skip,
        take: pagination.limit,
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        include: { reporter: { select: { id: true, name: true, email: true } } }
      }),
      this.prisma.securityIncident.count()
    ]);

    return { items, total, page: pagination.page, limit: pagination.limit };
  }

  async createIncident(reporterId: string, dto: CreateIncidentDto) {
    const incident = await this.prisma.securityIncident.create({
      data: {
        reporterId,
        location: dto.location,
        category: dto.category,
        description: dto.description,
        severity: dto.severity,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.severity === Severity.CRITICAL ? IncidentStatus.TRIAGED : IncidentStatus.OPEN,
        aiSummary: this.summarizeIncident(dto)
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: reporterId,
        action: "SECURITY_INCIDENT_CREATED",
        entity: "SecurityIncident",
        entityId: incident.id,
        metadata: { severity: dto.severity, location: dto.location }
      }
    });

    return incident;
  }

  async createMedicalRequest(requesterId: string, dto: CreateMedicalRequestDto) {
    const request = await this.prisma.medicalRequest.create({
      data: {
        requesterId,
        location: dto.location,
        description: dto.description,
        severity: dto.severity,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: dto.severity === Severity.CRITICAL ? RequestStatus.ASSIGNED : RequestStatus.OPEN,
        assignedTeam: dto.severity === Severity.CRITICAL ? "Rapid Response Team 1" : null,
        responseDueAt: new Date(Date.now() + (dto.severity === Severity.CRITICAL ? 120_000 : 600_000))
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: "MEDICAL_REQUEST_CREATED",
        entity: "MedicalRequest",
        entityId: request.id,
        metadata: { severity: dto.severity, location: dto.location }
      }
    });

    return request;
  }

  private summarizeIncident(dto: CreateIncidentDto) {
    const prefix = dto.severity === Severity.CRITICAL ? "Immediate command review required." : "Operational review recommended.";
    return `${prefix} ${dto.category} at ${dto.location}: ${dto.description}`;
  }
}

