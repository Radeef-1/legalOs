import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

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
