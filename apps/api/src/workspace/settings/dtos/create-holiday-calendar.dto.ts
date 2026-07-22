import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHolidayCalendarDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم تقويم الإجازات مطلوب' })
  name: string;
}
