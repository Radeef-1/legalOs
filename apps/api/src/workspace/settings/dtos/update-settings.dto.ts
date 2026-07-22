import { IsObject, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsObject()
  @IsOptional()
  branding?: any;

  @IsObject()
  @IsOptional()
  localization?: any;

  @IsObject()
  @IsOptional()
  preferences?: any;

  @IsObject()
  @IsOptional()
  numbering?: any;

  @IsObject()
  @IsOptional()
  featureFlags?: any;
}
