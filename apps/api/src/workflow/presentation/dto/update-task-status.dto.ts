import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus, { message: 'حالة المهمة غير صالحة' })
  @IsNotEmpty({ message: 'حالة المهمة مطلوبة' })
  status: TaskStatus;
}
