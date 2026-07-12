import { PrismaClient, RoleName, Severity, NotificationChannel } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const password = "StadiumGPT2026!";

async function resetDemoData() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aiMessage.deleteMany();
  await prisma.aiConversation.deleteMany();
  await prisma.accessibilityRequest.deleteMany();
  await prisma.volunteerAssignment.deleteMany();
  await prisma.medicalRequest.deleteMany();
  await prisma.securityIncident.deleteMany();
  await prisma.crowdReading.deleteMany();
  await prisma.crowdSensor.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.foodVendor.deleteMany();
  await prisma.transportStop.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.routeStep.deleteMany();
  await prisma.route.deleteMany();
  await prisma.parkingReservation.deleteMany();
  await prisma.parkingLot.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.carbonTracking.deleteMany();
  await prisma.analyticsMetric.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.gate.deleteMany();
  await prisma.stadium.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
}

async function seedRoles() {
  const actions = [
    "read:dashboard",
    "write:incidents",
    "read:analytics",
    "write:medical",
    "read:maps",
    "write:notifications",
    "admin:all"
  ];

  const permissions = await Promise.all(
    actions.map((action) =>
      prisma.permission.create({
        data: { action, description: `Allows ${action}` }
      })
    )
  );

  const roleMap = new Map<RoleName, string[]>();
  roleMap.set(RoleName.ADMIN, actions);
  roleMap.set(RoleName.ORGANIZER, ["read:dashboard", "write:incidents", "read:analytics", "read:maps", "write:notifications"]);
  roleMap.set(RoleName.SECURITY, ["read:dashboard", "write:incidents", "read:maps"]);
  roleMap.set(RoleName.MEDICAL, ["read:dashboard", "write:medical", "read:maps"]);
  roleMap.set(RoleName.VOLUNTEER, ["read:dashboard", "write:incidents", "read:maps"]);
  roleMap.set(RoleName.FAN, ["read:dashboard", "read:maps"]);
  roleMap.set(RoleName.STAFF, ["read:dashboard", "read:maps"]);
  roleMap.set(RoleName.ACCESSIBILITY, ["read:dashboard", "read:maps", "write:medical"]);
  roleMap.set(RoleName.SUSTAINABILITY, ["read:dashboard", "read:analytics"]);

  const roles = new Map<RoleName, { id: string }>();
  for (const [name, allowed] of roleMap) {
    const role = await prisma.role.create({
      data: {
        name,
        description: `${name.toLowerCase()} permissions`,
        permissions: {
          create: permissions
            .filter((permission) => allowed.includes(permission.action))
            .map((permission) => ({ permissionId: permission.id }))
        }
      }
    });
    roles.set(name, role);
  }

  return roles;
}

async function createUser(email: string, name: string, roleName: RoleName, roles: Map<RoleName, { id: string }>) {
  const role = roles.get(roleName);
  if (!role) throw new Error(`Missing role ${roleName}`);
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
      preferredLanguage: email.startsWith("fan") ? "es-US" : "en-US",
      accessibilityNeeds: email.startsWith("fan") ? "Step-free route and voice directions" : null,
      roles: { create: { roleId: role.id } }
    }
  });
}

async function main() {
  await resetDemoData();
  const roles = await seedRoles();

  const [admin, fan, organizer, security, medical, volunteer] = await Promise.all([
    createUser("admin@stadiumgpt.ai", "Admin Operator", RoleName.ADMIN, roles),
    createUser("fan@stadiumgpt.ai", "Matchday Fan", RoleName.FAN, roles),
    createUser("organizer@stadiumgpt.ai", "Operations Organizer", RoleName.ORGANIZER, roles),
    createUser("security@stadiumgpt.ai", "Security Lead", RoleName.SECURITY, roles),
    createUser("medical@stadiumgpt.ai", "Medical Commander", RoleName.MEDICAL, roles),
    createUser("volunteer@stadiumgpt.ai", "Volunteer Captain", RoleName.VOLUNTEER, roles)
  ]);

  const stadium = await prisma.stadium.create({
    data: {
      name: "MetLife Stadium",
      city: "East Rutherford",
      country: "USA",
      capacity: 82500,
      latitude: 40.8136,
      longitude: -74.0745
    }
  });

  const [homeTeam, awayTeam] = await Promise.all([
    prisma.team.create({
      data: {
        name: "United States",
        countryCode: "USA",
        players: {
          create: [
            { name: "Alex Morgan", position: "FW", shirtNumber: 13 },
            { name: "Tyler Adams", position: "MF", shirtNumber: 4 }
          ]
        }
      }
    }),
    prisma.team.create({
      data: {
        name: "Canada",
        countryCode: "CAN",
        players: {
          create: [
            { name: "Alphonso Davies", position: "DF", shirtNumber: 19 },
            { name: "Jonathan David", position: "FW", shirtNumber: 20 }
          ]
        }
      }
    })
  ]);

  const match = await prisma.match.create({
    data: {
      stadiumId: stadium.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      kickoffAt: new Date("2026-06-14T19:00:00.000Z"),
      round: "Group Stage"
    }
  });

  const seats = await Promise.all(
    ["231", "232", "233", "118"].flatMap((section) =>
      Array.from({ length: 6 }).map((_, index) =>
        prisma.seat.create({
          data: {
            stadiumId: stadium.id,
            section,
            row: section === "118" ? "9" : "14",
            number: `${index + 1}`,
            accessible: section === "232" && index < 2,
            companionSeat: section === "232" && index === 1
          }
        })
      )
    )
  );

  await prisma.ticket.create({
    data: {
      userId: fan.id,
      matchId: match.id,
      seatId: seats.find((seat) => seat.section === "232" && seat.accessible)?.id ?? seats[0].id,
      qrCode: "SGPT-FAN-SECTION-232"
    }
  });

  await prisma.gate.createMany({
    data: [
      { stadiumId: stadium.id, name: "Gate C", latitude: 40.816, longitude: -74.076, accessible: false, queueMinute: 18 },
      { stadiumId: stadium.id, name: "Gate D", latitude: 40.812, longitude: -74.071, accessible: true, queueMinute: 5 },
      { stadiumId: stadium.id, name: "Gate E", latitude: 40.811, longitude: -74.077, accessible: true, queueMinute: 9 }
    ]
  });

  const [parkingLot] = await Promise.all([
    prisma.parkingLot.create({
      data: { stadiumId: stadium.id, name: "Parking B", latitude: 40.809, longitude: -74.078, capacity: 1600, accessible: true, evChargers: 42 }
    }),
    prisma.parkingLot.create({
      data: { stadiumId: stadium.id, name: "Parking F", latitude: 40.818, longitude: -74.081, capacity: 2400, accessible: false, evChargers: 16 }
    })
  ]);

  await prisma.parkingReservation.create({
    data: {
      userId: fan.id,
      lotId: parkingLot.id,
      startsAt: new Date("2026-06-14T15:00:00.000Z"),
      endsAt: new Date("2026-06-15T02:00:00.000Z"),
      plate: "WC26FAN"
    }
  });

  const route = await prisma.route.create({
    data: {
      stadiumId: stadium.id,
      name: "Parking B to Gate D Step-Free",
      fromLabel: "Parking B",
      toLabel: "Gate D",
      distanceMeters: 620,
      durationMinutes: 8,
      accessible: true,
      carbonGramsSaved: 2800,
      steps: {
        create: [
          { sequence: 1, text: "Follow the green accessible path from Parking B toward the south concourse." },
          { sequence: 2, text: "Use ramp S2 and continue past Medical Post 2." },
          { sequence: 3, text: "Enter at Gate D and use elevator bank E2 for section 232." }
        ]
      }
    }
  });

  const vendor = await prisma.foodVendor.create({
    data: {
      stadiumId: stadium.id,
      name: "Garden Grill",
      section: "232",
      cuisine: "Vegetarian",
      accessible: true,
      waitMinutes: 3,
      menuItems: {
        create: [
          { name: "Falafel Bowl", priceCents: 1450, allergens: ["sesame"], vegetarian: true },
          { name: "Electrolyte Water", priceCents: 550, allergens: [], vegetarian: true }
        ]
      }
    }
  });

  const menuItem = await prisma.menuItem.findFirstOrThrow({ where: { vendorId: vendor.id, name: "Electrolyte Water" } });
  await prisma.order.create({
    data: {
      userId: fan.id,
      vendorId: vendor.id,
      status: "READY",
      totalCents: 550,
      pickupCode: "WATER232",
      items: { create: { menuItemId: menuItem.id, quantity: 1 } }
    }
  });

  const routeRecord = await prisma.transportRoute.create({
    data: {
      stadiumId: stadium.id,
      name: "Rail Shuttle Blue",
      mode: "RAIL_SHUTTLE",
      provider: "Regional Transit",
      headwayMinutes: 7,
      co2GramsSaved: 2800,
      stops: {
        create: [
          { name: "Transit Hub", sequence: 1, latitude: 40.809, longitude: -74.078 },
          { name: "Secaucus Junction", sequence: 2, latitude: 40.761, longitude: -74.075 }
        ]
      }
    }
  });

  const [northSensor, gateSensor] = await Promise.all([
    prisma.crowdSensor.create({ data: { stadiumId: stadium.id, zone: "North Plaza", latitude: 40.817, longitude: -74.074, sensorType: "COMPUTER_VISION" } }),
    prisma.crowdSensor.create({ data: { stadiumId: stadium.id, zone: "Gate C", latitude: 40.816, longitude: -74.076, sensorType: "TURNSTILE" } })
  ]);

  await prisma.crowdReading.createMany({
    data: [
      { sensorId: northSensor.id, density: 0.84, flowRate: 1120, queueMinutes: 16, risk: Severity.HIGH },
      { sensorId: gateSensor.id, density: 0.78, flowRate: 980, queueMinutes: 18, risk: Severity.HIGH },
      { sensorId: northSensor.id, density: 0.62, flowRate: 760, queueMinutes: 9, risk: Severity.MEDIUM }
    ]
  });

  await prisma.securityIncident.create({
    data: {
      reporterId: security.id,
      matchId: match.id,
      location: "North Plaza",
      latitude: 40.817,
      longitude: -74.074,
      category: "Crowd surge",
      description: "Crowd compression near Gate C after transit arrivals.",
      severity: Severity.HIGH,
      status: "TRIAGED",
      aiSummary: "Open overflow lane and dispatch rover team to North Plaza."
    }
  });

  await prisma.medicalRequest.create({
    data: {
      requesterId: volunteer.id,
      matchId: match.id,
      location: "Section 118, row 9",
      latitude: 40.814,
      longitude: -74.072,
      description: "Fan reports dizziness and requests medical assistance.",
      severity: Severity.MEDIUM,
      assignedTeam: "Medical Team 4",
      status: "ASSIGNED",
      responseDueAt: new Date(Date.now() + 300_000)
    }
  });

  await prisma.volunteerAssignment.create({
    data: {
      userId: volunteer.id,
      role: "Accessibility guide",
      location: "Parking B",
      startsAt: new Date("2026-06-14T16:00:00.000Z"),
      endsAt: new Date("2026-06-14T22:00:00.000Z"),
      instructions: `Guide fans along ${route.name}.`
    }
  });

  await prisma.accessibilityRequest.create({
    data: {
      userId: fan.id,
      category: "Wheelchair routing",
      description: "Need step-free route from Parking B to section 232.",
      location: "Parking B",
      status: "ASSIGNED"
    }
  });

  await prisma.carbonTracking.createMany({
    data: [
      { stadiumId: stadium.id, matchId: match.id, category: "Transport", co2eKg: 18400, recommendation: `Promote ${routeRecord.name} and staggered departure notifications.` },
      { stadiumId: stadium.id, matchId: match.id, category: "Waste", co2eKg: 2600, recommendation: "Add volunteers to recycling islands near sections 230-240." },
      { stadiumId: stadium.id, matchId: match.id, category: "Energy", co2eKg: 9100, recommendation: "Dim concourse lighting in low-density zones after halftime." }
    ]
  });

  await prisma.analyticsMetric.createMany({
    data: [
      { matchId: match.id, key: "queue_minutes_gate_c", value: 18, unit: "minutes", dimension: "Gate C" },
      { matchId: match.id, key: "volunteer_coverage", value: 94, unit: "percent", dimension: "All zones" },
      { matchId: match.id, key: "medical_response_median", value: 130, unit: "seconds", dimension: "Medical" },
      { matchId: match.id, key: "carbon_saved", value: 18.4, unit: "tonnes", dimension: "Transport" }
    ]
  });

  for (const user of [admin, organizer, security, medical, volunteer, fan]) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Gate C queue threshold exceeded",
        body: "Open overflow lane and route fans with accessibility needs to Gate D.",
        channel: NotificationChannel.IN_APP,
        severity: Severity.HIGH
      }
    });
  }

  await prisma.aiConversation.create({
    data: {
      userId: organizer.id,
      module: "ORGANIZER",
      language: "en-US",
      title: "Crowd risk summary",
      messages: {
        create: [
          { role: "user", content: "Summarize Gate C risk.", citations: [] },
          { role: "assistant", content: "Gate C is elevated. Open overflow lane and move six volunteers from South Fan Zone.", citations: ["crowd_sensor:north_plaza"] }
        ]
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "DEMO_SEED_COMPLETED",
      entity: "System",
      metadata: { stadium: stadium.name, match: match.id, users: 6 }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
