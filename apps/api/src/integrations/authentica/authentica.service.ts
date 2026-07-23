import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

export interface AuthenticaBalanceResponse {
  success: boolean;
  balance?: any;
  message?: string;
}

export class SendOtpDto {
  method?: 'sms' | 'whatsapp' | 'email';
  phone?: string;
  email?: string;
  template_id?: number;
  fallback_phone?: string;
  fallback_email?: string;
  otp?: string;
}

export class VerifyOtpDto {
  phone?: string;
  email?: string;
  otp: string;
}

export class VerifyFaceDto {
  user_id: string;
  registered_face_image: string;
  query_face_image: string;
}

export class VerifyVoiceDto {
  user_id: string;
  registered_audio: string;
  query_audio: string;
}

@Injectable()
export class AuthenticaService {
  private readonly logger = new Logger(AuthenticaService.name);
  private readonly apiKey = process.env.AUTHENTICA_API_KEY || '$2y$10$cDEg5UkxkpJX4W31nXzfFuaF8FLl49xs3js8q5.FB8kkHykuSBMMW';
  private readonly baseUrl = process.env.AUTHENTICA_BASE_URL || 'https://api.authentica.sa/api/v2';

  private getHeaders(contentType: string = 'application/json') {
    return {
      'X-Authorization': this.apiKey,
      'Accept': 'application/json',
      'Content-Type': contentType,
    };
  }

  /**
   * Fetches current account balance from Authentica.sa API.
   */
  async getBalance(): Promise<AuthenticaBalanceResponse> {
    this.logger.log(`[Authentica.sa] Fetching current account balance from ${this.baseUrl}/balance...`);
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`[Authentica.sa] Balance query returned HTTP ${response.status}: ${errText}`);
        return {
          success: false,
          message: `Authentica API HTTP ${response.status}: ${errText}`,
        };
      }

      const data = await response.json();
      this.logger.log(`[Authentica.sa] Balance fetched successfully: ${JSON.stringify(data)}`);
      return {
        success: true,
        balance: data,
      };
    } catch (err: any) {
      this.logger.error(`[Authentica.sa] Balance request failed: ${err.message}`);
      return {
        success: false,
        message: err.message || 'Authentica API Connection Failed',
      };
    }
  }

  /**
   * Sends an OTP via SMS, WhatsApp, or Email using Authentica API v2.
   */
  async sendOtp(dto: SendOtpDto): Promise<any> {
    this.logger.log(`[Authentica.sa] Sending OTP via method "${dto.method || 'sms'}" to ${dto.phone || dto.email}...`);
    try {
      const response = await fetch(`${this.baseUrl}/send-otp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          method: dto.method || 'sms',
          phone: dto.phone,
          email: dto.email,
          template_id: dto.template_id || 31,
          fallback_phone: dto.fallback_phone,
          fallback_email: dto.fallback_email,
          otp: dto.otp,
        }),
      });

      const resText = await response.text();
      let resJson: any = {};
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        resJson = { raw: resText };
      }

      if (!response.ok) {
        this.logger.warn(`[Authentica.sa] Send OTP returned HTTP ${response.status}: ${resText}`);
      }

      return {
        success: response.ok,
        status: response.status,
        data: resJson,
      };
    } catch (err: any) {
      this.logger.error(`[Authentica.sa] Send OTP request failed: ${err.message}`);
      throw new HttpException(
        { success: false, message: err.message || 'Send OTP Request Failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifies the OTP entered by the user via Authentica API v2.
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<any> {
    this.logger.log(`[Authentica.sa] Verifying OTP for ${dto.phone || dto.email}...`);
    try {
      const response = await fetch(`${this.baseUrl}/verify-otp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: dto.phone,
          email: dto.email,
          otp: dto.otp,
        }),
      });

      const resText = await response.text();
      let resJson: any = {};
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        resJson = { raw: resText };
      }

      return {
        success: response.ok,
        status: response.status,
        data: resJson,
      };
    } catch (err: any) {
      this.logger.error(`[Authentica.sa] Verify OTP request failed: ${err.message}`);
      throw new HttpException(
        { success: false, message: err.message || 'Verify OTP Request Failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifies reference face image against query face image via Authentica API v2.
   */
  async verifyByFace(dto: VerifyFaceDto): Promise<any> {
    this.logger.log(`[Authentica.sa] Performing Face Biometric Verification for User ID: ${dto.user_id}...`);
    try {
      const response = await fetch(`${this.baseUrl}/verify-by-face`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
      };
    } catch (err: any) {
      this.logger.error(`[Authentica.sa] Face verification failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  /**
   * Verifies reference audio against query audio via Authentica API v2.
   */
  async verifyByVoice(dto: VerifyVoiceDto): Promise<any> {
    this.logger.log(`[Authentica.sa] Performing Voice Biometric Verification for User ID: ${dto.user_id}...`);
    try {
      const response = await fetch(`${this.baseUrl}/verify-by-voice`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });

      const data = await response.json();
      return {
        success: response.ok,
        data,
      };
    } catch (err: any) {
      this.logger.error(`[Authentica.sa] Voice verification failed: ${err.message}`);
      return { success: false, message: err.message };
    }
  }
}
