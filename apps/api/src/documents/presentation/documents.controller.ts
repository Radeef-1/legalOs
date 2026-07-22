import { Controller, Get, Post, Param, Res, UseGuards, UseInterceptors, UploadedFile, Query, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from '../application/documents.service';
import { AuthGuard } from '../../shared/guards/auth.guard';
import * as express from 'express';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Query('caseId') caseId?: string,
  ) {
    const data = await this.documentsService.upload(file, caseId);
    return {
      success: true,
      data,
    };
  }

  @Get('case/:caseId')
  async findAllForCase(@Param('caseId') caseId: string) {
    const data = await this.documentsService.findAllForCase(caseId);
    return {
      success: true,
      data,
    };
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: express.Response) {
    const { buffer, fileType, storagePath } = await this.documentsService.download(id);
    const filename = storagePath.split('/').pop() || 'downloaded-file';
    
    res.set({
      'Content-Type': fileType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });
    
    return res.status(HttpStatus.OK).send(buffer);
  }
}
