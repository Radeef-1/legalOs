import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateHearingDto {
  @IsUUID('all', { message: 'معرف القضية غير صالح' })
  @IsNotEmpty({ message: 'القضية مطلوبة' })
  caseId: string;

  @IsDateString({}, { message: 'تاريخ الجلسة المدخل غير صالح' })
  @IsNotEmpty({ message: 'تاريخ الجلسة مطلوب' })
  hearingDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
