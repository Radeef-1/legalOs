import { Injectable, Logger } from '@nestjs/common';

export interface GoogleCalendarEventPayload {
  title: string;
  location?: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails?: string[];
}

export interface GoogleCalendarSyncResult {
  synced: boolean;
  googleEventId: string;
  htmlLink: string;
  syncedAt: Date;
}

@Injectable()
export class GoogleCalendarSyncService {
  private readonly logger = new Logger(GoogleCalendarSyncService.name);

  /**
   * Mock Google Workspace Calendar API v3 Event Creation & Synchronization.
   */
  async syncEventToGoogle(
    accessToken: string,
    payload: GoogleCalendarEventPayload,
  ): Promise<GoogleCalendarSyncResult> {
    this.logger.log(
      `[Google Calendar Connector] Pushing Event "${payload.title}" to Google Calendar API v3...`,
    );

    const googleEventId = `gcal_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const htmlLink = `https://calendar.google.com/calendar/event?eid=${googleEventId}`;
    const syncedAt = new Date();

    return {
      synced: true,
      googleEventId,
      htmlLink,
      syncedAt,
    };
  }
}
