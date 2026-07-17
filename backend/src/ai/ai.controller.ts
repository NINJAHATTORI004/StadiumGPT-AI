import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { JwtUser } from "../common/types/jwt-user";
import { AiService } from "./ai.service";
import { AiChatDto } from "./dto/ai-chat.dto";
import { SpeakDto } from "./dto/speak.dto";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat")
  chat(@Body() dto: AiChatDto) {
    const guestUser: JwtUser = {
      sub: "anonymous",
      email: "guest@stadiumgpt.ai",
      name: "Guest",
      roles: ["FAN"]
    };
    return this.aiService.chat(guestUser, dto);
  }

  @Post("transcribe")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  transcribe(@UploadedFile() file: Express.Multer.File) {
    return this.aiService.transcribe(file);
  }

  @Post("speak")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  speak(@Body() dto: SpeakDto) {
    return this.aiService.speak(dto);
  }
}