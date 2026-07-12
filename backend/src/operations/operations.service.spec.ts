import { Severity } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OperationsService } from "./operations.service";

describe("OperationsService", () => {
  it("triages critical incidents and writes an audit log", async () => {
    const prisma = {
      securityIncident: {
        create: jest.fn().mockResolvedValue({ id: "incident-1", status: "TRIAGED" })
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({})
      }
    };
    const service = new OperationsService(prisma as unknown as PrismaService);

    const result = await service.createIncident("user-1", {
      location: "Gate C",
      category: "Crowd",
      description: "Crowd pressure is rising.",
      severity: Severity.CRITICAL
    });

    expect(result.status).toBe("TRIAGED");
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "SECURITY_INCIDENT_CREATED" })
      })
    );
  });
});
