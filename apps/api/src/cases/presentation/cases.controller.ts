import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { CasesService } from '../application/cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { PermissionsGuard } from '../../shared/guards/permissions.guard';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { PolicyGuard } from '../../shared/policy/guards/policy.guard';
import { CheckPolicy } from '../../shared/policy/decorators/check-policy.decorator';
import { PdfService } from '../../shared/pdf/pdf.service';
import * as express from 'express';

@Controller('cases')
@UseGuards(AuthGuard, PermissionsGuard, PolicyGuard)
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Permissions('cases.create')
  @CheckPolicy('cases.create', 'Case')
  async create(@Body() createCaseDto: CreateCaseDto) {
    const data = await this.casesService.create(createCaseDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  @Permissions('cases.view')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const result = await this.casesService.findAll(pageNum, limitNum, search, status);
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  @Permissions('cases.view')
  @CheckPolicy('cases.view', 'Case')
  async findOne(@Param('id') id: string) {
    const data = await this.casesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  @Permissions('cases.update')
  @CheckPolicy('cases.update', 'Case')
  async update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    const data = await this.casesService.update(id, updateCaseDto);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @Permissions('cases.delete')
  @CheckPolicy('cases.delete', 'Case')
  async remove(@Param('id') id: string) {
    const data = await this.casesService.remove(id);
    return {
      success: true,
      data,
    };
  }

  @Get(':id/pdf')
  @Permissions('cases.view')
  @CheckPolicy('cases.view', 'Case')
  async downloadPdf(@Param('id') id: string, @Res() res: express.Response) {
    const caseItem = await this.casesService.findOne(id);
    const buffer = await this.pdfService.generateCaseReport(caseItem);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="case-${caseItem.caseNumberInternal}.pdf"`,
    });
    
    return res.status(HttpStatus.OK).send(buffer);
  }
}
