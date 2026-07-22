import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { CaseType } from '@prisma/client';

export class CreateCaseDto {
  @IsUUID(4, { message: 'معرف العميل غير صالح' })
  @IsNotEmpty({ message: 'العميل مطلوب' })
  clientId: string;

  @IsUUID(4, { message: 'معرف المحامي غير صالح' })
  @IsOptional()
  assignedLawyerId?: string;

  @IsString({ message: 'رقم القضية الداخلي يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم القضية الداخلي مطلوب' })
  caseNumberInternal: string;

  @IsString()
  @IsOptional()
  najizCaseNumber?: string;

  @IsEnum(CaseType, { message: 'نوع القضية غير صالح' })
  @IsNotEmpty({ message: 'نوع القضية مطلوب' })
  caseType: CaseType;

  @IsString()
  @IsOptional()
  courtName?: string;
}
