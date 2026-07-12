import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        preferredLanguage: true,
        accessibilityNeeds: true,
        roles: { select: { role: { select: { name: true } } } },
        tickets: {
          take: 5,
          include: { seat: true, match: { include: { homeTeam: true, awayTeam: true, stadium: true } } }
        }
      }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      ...user,
      roles: user.roles.map((item) => item.role.name)
    };
  }
}

