import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty({ message: 'توكن الدعوة مطلوب' })
  token: string;

  @IsString()
  @IsNotEmpty({ message: 'الاسم الكامل مطلوب' })
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' })
  password: string;
}
