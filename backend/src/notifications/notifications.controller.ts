import { Controller, Get, Patch, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { JwtUser } from "../common/types/jwt-user";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.notificationsService.list(user.sub);
  }

  @Patch(":id/read")
  markRead(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.notificationsService.markRead(user.sub, id);
  }
}

