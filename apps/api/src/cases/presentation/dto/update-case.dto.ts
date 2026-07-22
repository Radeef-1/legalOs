import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { CaseStatus } from '@prisma/client';

export class UpdateCaseDto {
  @IsUUID(4, { message: 'معرف المحامي غير صالح' })
  @IsOptional()
  assignedLawyerId?: string;

  @IsString()
  @IsOptional()
  courtName?: string;

  @IsEnum(CaseStatus, { message: 'حالة القضية غير صالحة' })
  @IsOptional()
  status?: CaseStatus;
}
