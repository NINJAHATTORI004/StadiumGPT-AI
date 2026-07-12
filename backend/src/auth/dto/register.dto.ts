import { ApiProperty } from "@nestjs/swagger";
import { RoleName } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "fan@stadiumgpt.ai" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Matchday Fan" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: "StadiumGPT2026!" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: RoleName, default: RoleName.FAN })
  @IsOptional()
  @IsEnum(RoleName)
  role: RoleName = RoleName.FAN;
}

