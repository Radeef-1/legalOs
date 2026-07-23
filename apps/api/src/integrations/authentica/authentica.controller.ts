import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  AuthenticaService,
  SendOtpDto,
  VerifyOtpDto,
  VerifyFaceDto,
  VerifyVoiceDto,
} from './authentica.service';

@Controller('integrations/authentica')
export class AuthenticaController {
  constructor(private readonly authenticaService: AuthenticaService) {}

  @Get('balance')
  async getBalance() {
    const data = await this.authenticaService.getBalance();
    return { success: true, data };
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: SendOtpDto) {
    const data = await this.authenticaService.sendOtp(body);
    return { success: true, data };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const data = await this.authenticaService.verifyOtp(body);
    return { success: true, data };
  }

  @Post('verify-face')
  @HttpCode(HttpStatus.OK)
  async verifyFace(@Body() body: VerifyFaceDto) {
    const data = await this.authenticaService.verifyByFace(body);
    return { success: true, data };
  }

  @Post('verify-voice')
  @HttpCode(HttpStatus.OK)
  async verifyVoice(@Body() body: VerifyVoiceDto) {
    const data = await this.authenticaService.verifyByVoice(body);
    return { success: true, data };
  }
}
