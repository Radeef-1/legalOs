import { Injectable, Logger } from '@nestjs/common';

export interface PaymentMethodDetails {
  type: 'MADA' | 'CREDIT_CARD' | 'APPLE_PAY';
  cardNumber?: string;
  applePayToken?: string;
}

export interface PaymentTransactionResult {
  success: boolean;
  transactionId: string;
  amountSar: number;
  paymentMethod: string;
  processedAt: Date;
  receiptUrl?: string;
}

@Injectable()
export class PaymentGatewayAdapter {
  private readonly logger = new Logger(PaymentGatewayAdapter.name);

  async processPayment(
    amountSar: number,
    paymentMethod: PaymentMethodDetails,
  ): Promise<PaymentTransactionResult> {
    this.logger.log(
      `Processing Moyasar/HyperPay Payment Gateway Transaction: ${amountSar} SAR via ${paymentMethod.type}`,
    );

    // Mock successful payment gateway transaction
    const transactionId = `txn_saas_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      transactionId,
      amountSar,
      paymentMethod: paymentMethod.type,
      processedAt: new Date(),
      receiptUrl: `https://billing.legalos.sa/receipts/${transactionId}`,
    };
  }
}
