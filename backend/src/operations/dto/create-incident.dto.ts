import { ApiProperty } from "@nestjs/swagger";
import { Severity } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateIncidentDto {
  @ApiProperty({ example: "North Plaza" })
  @IsString()
  location!: string;

  @ApiProperty({ example: "Crowd surge" })
  @IsString()
  category!: string;

  @ApiProperty({ example: "Crowd density is increasing near Gate C." })
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

