import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class SpeakDto {
  @ApiProperty({ example: "Use Gate D for the lowest queue and step-free route." })
  @IsString()
  @MinLength(2)
  text!: string;

  @ApiProperty({ example: "alloy", required: false, enum: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] })
  @IsOptional()
  @IsIn(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
  voice?: string;
}
