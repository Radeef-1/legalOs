import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsEmail } from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsOptional()
  email?: string;

  @IsUUID('4', { message: 'معرف المدير غير صالح' })
  @IsOptional()
  managerMemberId?: string;

  @IsNumber({}, { message: 'خط العرض الجغرافي يجب أن يكون رقماً' })
  @IsOptional()
  latitude?: number;

  @IsNumber({}, { message: 'خط الطول الجغرافي يجب أن يكون رقماً' })
  @IsOptional()
  longitude?: number;

  @IsBoolean()
  @IsOptional()
  isHeadOffice?: boolean;
}
