import { IsNotEmpty, IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'العنوان مطلوب' })
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID('all', { message: 'معرف القضية غير صالح' })
  @IsOptional()
  caseId?: string;

  @IsUUID('all', { message: 'معرف المحامي غير صالح' })
  @IsOptional()
  assignedToId?: string;

  @IsDateString({}, { message: 'التاريخ المحدد غير صالح' })
  @IsOptional()
  dueDate?: string;
}
