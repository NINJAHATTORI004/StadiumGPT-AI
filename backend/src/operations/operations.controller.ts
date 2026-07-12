import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { RoleName } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import type { JwtUser } from "../common/types/jwt-user";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { CreateMedicalRequestDto } from "./dto/create-medical-request.dto";
import { FanContextQueryDto } from "./dto/fan-context-query.dto";
import { OperationsService } from "./operations.service";

@ApiTags("operations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("operations")
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get("dashboard/:role")
  dashboard(@Param("role") role: string) {
    return this.operationsService.dashboard(role);
  }

  @Get("fan-context")
  fanContext(@Query() query: FanContextQueryDto) {
    return this.operationsService.fanContext(query);
  }

  @Get("crowd")
  crowd(@Query() pagination: PaginationDto) {
    return this.operationsService.crowd(pagination);
  }

  @Get("security-incidents")
  @Roles(RoleName.ADMIN, RoleName.ORGANIZER, RoleName.SECURITY)
  incidents(@Query() pagination: PaginationDto) {
    return this.operationsService.securityIncidents(pagination);
  }

  @Post("security-incidents")
  @Roles(RoleName.ADMIN, RoleName.ORGANIZER, RoleName.SECURITY, RoleName.VOLUNTEER)
  createIncident(@CurrentUser() user: JwtUser, @Body() dto: CreateIncidentDto) {
    return this.operationsService.createIncident(user.sub, dto);
  }

  @Post("medical-requests")
  @Roles(RoleName.ADMIN, RoleName.ORGANIZER, RoleName.MEDICAL, RoleName.VOLUNTEER, RoleName.FAN)
  createMedicalRequest(@CurrentUser() user: JwtUser, @Body() dto: CreateMedicalRequestDto) {
    return this.operationsService.createMedicalRequest(user.sub, dto);
  }
}

