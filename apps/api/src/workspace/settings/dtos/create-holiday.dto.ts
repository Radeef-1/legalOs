import { IsString, IsNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateHolidayDto {
  @IsUUID('4', { message: 'معرف تقويم الإجازات غير صالح' })
  holidayCalendarId: string;

  @IsString()
  @IsNotEmpty({ message: 'تاريخ الإجازة مطلوب' })
  date: string; // ISO String

  @IsString()
  @IsNotEmpty({ message: 'اسم الإجازة مطلوب' })
  name: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}
