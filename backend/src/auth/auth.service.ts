import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RoleName } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const role = await this.prisma.role.upsert({
      where: { name: dto.role },
      update: {},
      create: { name: dto.role, description: `${dto.role} role` }
    });
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        roles: { create: { roleId: role.id } }
      },
      include: { roles: { include: { role: true } } }
    });

    return this.issueToken(user.id, user.email, user.name, user.roles.map((item) => item.role.name));
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { roles: { include: { role: true } } }
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueToken(user.id, user.email, user.name, user.roles.map((item) => item.role.name));
  }

  private async issueToken(id: string, email: string, name: string, roles: RoleName[]) {
    const payload = { sub: id, email, name, roles };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: { id, email, name, roles }
    };
  }
}

