import { Controller, Get, Param } from '@nestjs/common';

@Controller('najiz-mock')
export class NajizMockController {
  @Get('cases/:caseNumber')
  async getCaseDetails(@Param('caseNumber') caseNumber: string) {
    return {
      success: true,
      data: {
        najizCaseNumber: caseNumber,
        courtName: 'محكمة الاستئناف بالرياض',
        caseType: 'commercial',
        status: 'in_progress',
        openedAt: '2026-01-15T08:00:00Z',
        parties: [
          { name: 'شركة المدعى الأول الوطنية', role: 'plaintiff' },
          { name: 'مكتب الشريك للمحاماة', role: 'defendant_representative' },
        ],
      },
    };
  }

  @Get('hearings/:caseNumber')
  async getHearings(@Param('caseNumber') caseNumber: string) {
    return {
      success: true,
      data: [
        {
          id: 'hear-9999-1',
          najizCaseNumber: caseNumber,
          hearingDate: '2026-07-28T10:00:00Z',
          courtRoom: 'القاعة الافتراضية 4',
          meetingUrl: 'https://teams.microsoft.com/l/meetup-join/mock-najiz-hearing-room',
          status: 'scheduled',
        },
      ],
    };
  }
}
