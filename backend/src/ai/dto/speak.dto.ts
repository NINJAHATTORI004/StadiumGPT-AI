import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class SpeakDto {
  @ApiProperty({ example: "Use Gate D for the lowest queue and step-free route." })
  @IsString()
  @MinLength(2)
  text!: string;

  @ApiProperty({ example: "alloy", required: false })
  @IsOptional()
  @IsString()
  voice?: string;
}

