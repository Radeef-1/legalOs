import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'البريد الإلكتروني المدخل غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' })
  password: string;
}
