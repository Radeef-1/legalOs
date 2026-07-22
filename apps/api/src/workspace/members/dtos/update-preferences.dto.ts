import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdatePreferencesDto {
  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsObject()
  @IsOptional()
  notifications?: any;

  @IsString()
  @IsOptional()
  calendarView?: string;
}
