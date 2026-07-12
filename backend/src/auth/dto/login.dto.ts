import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "organizer@stadiumgpt.ai" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "StadiumGPT2026!" })
  @IsString()
  @MinLength(8)
  password!: string;
}

