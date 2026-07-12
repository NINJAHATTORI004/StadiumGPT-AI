import { IsOptional, IsString } from "class-validator";

export class FanContextQueryDto {
  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  parkingLot?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

