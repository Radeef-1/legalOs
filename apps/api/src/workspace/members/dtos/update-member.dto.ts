import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  employeeNumber?: string;

  @IsString()
  @IsOptional()
  employmentType?: string; // FULL_TIME, PART_TIME, CONTRACTOR, EXTERNAL, INTERN

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsEnum(UserStatus, { message: 'حالة العضو غير صالحة' })
  @IsOptional()
  status?: UserStatus;

  @IsUUID('4', { message: 'معرف الفرع غير صالح' })
  @IsOptional()
  branchId?: string;

  @IsUUID('4', { message: 'معرف القسم غير صالح' })
  @IsOptional()
  departmentId?: string;
}
