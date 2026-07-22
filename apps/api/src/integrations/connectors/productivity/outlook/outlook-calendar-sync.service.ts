import { Injectable, Logger } from '@nestjs/common';

export interface OutlookCalendarEventPayload {
  subject: string;
  bodyContent?: string;
  locationDisplayName?: string;
  startDateTime: Date;
  endDateTime: Date;
}

export interface OutlookCalendarSyncResult {
  synced: boolean;
  outlookEventId: string;
  webLink: string;
  syncedAt: Date;
}

@Injectable()
export class OutlookCalendarSyncService {
  private readonly logger = new Logger(OutlookCalendarSyncService.name);

  /**
   * Mock Microsoft Outlook 365 Graph API v1.0 Calendar Event Creation.
   */
  async syncEventToOutlook(
    accessToken: string,
    payload: OutlookCalendarEventPayload,
  ): Promise<OutlookCalendarSyncResult> {
    this.logger.log(
      `[Outlook 365 Connector] Pushing Event "${payload.subject}" to MS Graph API v1.0...`,
    );

    const outlookEventId = `ms_graph_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const webLink = `https://outlook.office365.com/calendar/item/${outlookEventId}`;
    const syncedAt = new Date();

    return {
      synced: true,
      outlookEventId,
      webLink,
      syncedAt,
    };
  }
}
