import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { OnboardingService, FirmVerificationApplication } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('save-step')
  @HttpCode(HttpStatus.OK)
  async saveStep(@Body() body: Partial<FirmVerificationApplication>) {
    const data = await this.onboardingService.saveOnboardingProgress(body);
    return { success: true, data };
  }

  @Post('extract-ocr')
  @HttpCode(HttpStatus.OK)
  async extractOcr(@Body() body: { fileType: 'moj_license' | 'cr_700' | 'national_id'; filename: string }) {
    const data = await this.onboardingService.extractDocumentOcr(body.fileType, body.filename);
    return { success: true, data };
  }

  @Post('submit-review/:id')
  @HttpCode(HttpStatus.OK)
  async submitReview(@Param('id') id: string) {
    const data = await this.onboardingService.submitForReview(id);
    return { success: true, data };
  }

  @Get('admin/pending')
  async getPendingFirms() {
    const data = await this.onboardingService.getPendingVerificationFirms();
    return { success: true, data };
  }

  @Post('admin/review/:id')
  @HttpCode(HttpStatus.OK)
  async reviewFirm(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject' | 'request_docs' | 'suspend'; reviewNotes?: string },
  ) {
    const data = await this.onboardingService.reviewFirmApplication(id, body.action, body.reviewNotes);
    return { success: true, data };
  }
}
