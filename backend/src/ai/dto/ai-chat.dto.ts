import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class AiChatDto {
  @ApiProperty({ example: "ORGANIZER" })
  @IsIn(["FAN", "ORGANIZER", "SECURITY", "VOLUNTEER", "ACCESSIBILITY", "SUSTAINABILITY", "MEDICAL"])
  module!: string;

  @ApiProperty({ example: "Summarize current crowd risks near Gate C." })
  @IsString()
  @MinLength(2)
  message!: string;

  @ApiProperty({ example: "en-US", required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: "openai", required: false, enum: ["openai", "zenmux"] })
  @IsOptional()
  @IsIn(["openai", "zenmux"])
  provider?: string;
}

