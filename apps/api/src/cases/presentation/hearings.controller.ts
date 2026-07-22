import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { HearingsService } from '../application/hearings.service';
import { CreateHearingDto } from './dto/create-hearing.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';

@Controller('hearings')
@UseGuards(AuthGuard)
export class HearingsController {
  constructor(private readonly hearingsService: HearingsService) {}

  @Post()
  async create(@Body() createHearingDto: CreateHearingDto) {
    const data = await this.hearingsService.create(createHearingDto);
    return {
      success: true,
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.hearingsService.findAll();
    return {
      success: true,
      data,
    };
  }
}
