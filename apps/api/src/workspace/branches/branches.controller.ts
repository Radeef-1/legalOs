import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dtos/create-branch.dto';
import { UpdateBranchDto } from './dtos/update-branch.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';

@Controller('workspace/branches')
@UseGuards(AuthGuard, PermissionsGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Permissions('workspace.manage')
  async create(@Body() createBranchDto: CreateBranchDto) {
    const data = await this.branchesService.create(createBranchDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @Permissions('workspace.manage')
  async findAll() {
    const data = await this.branchesService.findAll();
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @Permissions('workspace.manage')
  async findOne(@Param('id') id: string) {
    const data = await this.branchesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @Permissions('workspace.manage')
  async update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    const data = await this.branchesService.update(id, updateBranchDto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @Permissions('workspace.manage')
  async remove(@Param('id') id: string) {
    const data = await this.branchesService.remove(id);
    return {
      success: true,
      data,
    };
  }
}
