import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الفريق مطلوب' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID('4', { message: 'معرف القسم غير صالح' })
  @IsOptional()
  departmentId?: string;

  @IsUUID('4', { message: 'معرف الفريق الأب غير صالح' })
  @IsOptional()
  parentTeamId?: string;
}
