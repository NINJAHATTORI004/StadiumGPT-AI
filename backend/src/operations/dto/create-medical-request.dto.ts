import { ApiProperty } from "@nestjs/swagger";
import { Severity } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateMedicalRequestDto {
  @ApiProperty({ example: "Section 118, row 9" })
  @IsString()
  location!: string;

  @ApiProperty({ example: "Fan reports dizziness and needs medical assistance." })
  @IsString()
  @MinLength(5)
  description!: string;

  @ApiProperty({ enum: Severity, default: Severity.MEDIUM })
  @IsEnum(Severity)
  severity: Severity = Severity.MEDIUM;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

