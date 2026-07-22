import { IsNotEmpty, IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  name: string;

  @IsString({ message: 'رقم الهوية أو السجل التجاري يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم الهوية أو السجل التجاري مطلوب' })
  nationalIdOrCr: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'البريد الإلكتروني المدخل غير صالح' })
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  portalAccessEnabled?: boolean;
}
