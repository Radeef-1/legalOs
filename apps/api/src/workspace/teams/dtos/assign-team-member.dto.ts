import { IsUUID, IsBoolean, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class AssignTeamMemberDto {
  @IsUUID('4', { message: 'معرف العضو غير صالح' })
  memberId: string;

  @IsBoolean()
  @IsOptional()
  isLeader?: boolean;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  allocationType?: string; // Primary, Secondary, Temporary

  @IsInt()
  @Min(0, { message: 'نسبة التخصيص لا تقل عن 0' })
  @Max(100, { message: 'نسبة التخصيص لا تزيد عن 100' })
  @IsOptional()
  allocationPercent?: number;
}
