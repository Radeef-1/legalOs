import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from '../application/clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';

@Controller('clients')
@UseGuards(AuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const data = await this.clientsService.create(createClientDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const result = await this.clientsService.findAll(pageNum, limitNum, search);
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.clientsService.findOne(id);
    return {
      success: true,
      data,
    };
  }
}
