import { IsEmail, IsUUID, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail({}, { message: 'البريد الإلكتروني المدعو غير صالح' })
  email: string;

  @IsUUID('4', { message: 'معرف الدور غير صالح' })
  roleId: string;

  @IsUUID('4', { message: 'معرف الفرع غير صالح' })
  @IsOptional()
  branchId?: string;

  @IsUUID('4', { message: 'معرف القسم غير صالح' })
  @IsOptional()
  departmentId?: string;

  @IsUUID('4', { message: 'معرف الفريق غير صالح' })
  @IsOptional()
  teamId?: string;
}
