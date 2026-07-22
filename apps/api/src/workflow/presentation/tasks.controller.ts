import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { TasksService } from '../application/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const data = await this.tasksService.create(createTaskDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.tasksService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() updateDto: UpdateTaskStatusDto) {
    const data = await this.tasksService.updateStatus(id, updateDto.status);
    return {
      success: true,
      data,
    };
  }
}
