import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم القسم مطلوب' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID('4', { message: 'معرف القسم الأب غير صالح' })
  @IsOptional()
  parentDepartmentId?: string;

  @IsUUID('4', { message: 'معرف مدير القسم غير صالح' })
  @IsOptional()
  managerMemberId?: string;
}
