import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workspace/departments')
@UseGuards(AuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Permissions('workspace.manage')
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    const data = await this.departmentsService.create(createDepartmentDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @Permissions('workspace.manage')
  async findAll() {
    const data = await this.departmentsService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @Permissions('workspace.manage')
  async findOne(@Param('id') id: string) {
    const data = await this.departmentsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @Permissions('workspace.manage')
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    const data = await this.departmentsService.update(id, updateDepartmentDto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @Permissions('workspace.manage')
  async remove(@Param('id') id: string) {
    const data = await this.departmentsService.remove(id);
    return {
      success: true,
      data,
    };
  }
}
