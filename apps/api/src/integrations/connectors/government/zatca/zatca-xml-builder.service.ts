import { Injectable } from '@nestjs/common';

export interface ZatcaInvoicePayload {
  invoiceNumber: string;
  issueDate: Date;
  sellerCr: string;
  sellerVatNumber: string;
  sellerNameAr: string;
  buyerNameAr: string;
  buyerVatNumber?: string;
  amountSar: number;
  vatAmountSar: number;
  totalAmountSar: number;
  items: Array<{ description: string; unitPriceSar: number; qty: number }>;
}

@Injectable()
export class ZatcaXmlBuilderService {
  /**
   * Generates Saudi ZATCA E-Invoicing Phase 2 UBL 2.1 Standard XML Document.
   */
  buildUbl21Xml(payload: ZatcaInvoicePayload): string {
    const issueDateStr = payload.issueDate.toISOString().split('T')[0];
    const issueTimeStr = payload.issueDate.toISOString().split('T')[1].substring(0, 8);

    const itemsXml = payload.items
      .map(
        (item, idx) => `
    <cac:InvoiceLine>
        <cbc:ID>${idx + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="PCE">${item.qty}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="SAR">${(item.unitPriceSar * item.qty).toFixed(2)}</cbc:LineExtensionAmount>
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="SAR">${(item.unitPriceSar * item.qty * 0.15).toFixed(2)}</cbc:TaxAmount>
            <cac:TaxSubtotal>
                <cbc:TaxableAmount currencyID="SAR">${(item.unitPriceSar * item.qty).toFixed(2)}</cbc:TaxableAmount>
                <cbc:TaxAmount currencyID="SAR">${(item.unitPriceSar * item.qty * 0.15).toFixed(2)}</cbc:TaxAmount>
                <cac:TaxCategory>
                    <cbc:ID>S</cbc:ID>
                    <cbc:Percent>15.00</cbc:Percent>
                    <cac:TaxScheme>
                        <cbc:ID>VAT</cbc:ID>
                    </cac:TaxScheme>
                </cac:TaxCategory>
            </cac:TaxSubtotal>
        </cac:TaxTotal>
        <cac:Item>
            <cbc:Name>${item.description}</cbc:Name>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="SAR">${item.unitPriceSar.toFixed(2)}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
    <cbc:ID>${payload.invoiceNumber}</cbc:ID>

    <cbc:IssueDate>${issueDateStr}</cbc:IssueDate>
    <cbc:IssueTime>${issueTimeStr}</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>

    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="CRN">${payload.sellerCr}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>${payload.sellerNameAr}</cbc:Name>
            </cac:PartyName>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${payload.sellerVatNumber}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>${payload.buyerNameAr}</cbc:Name>
            </cac:PartyName>
            ${
              payload.buyerVatNumber
                ? `<cac:PartyTaxScheme>
                <cbc:CompanyID>${payload.buyerVatNumber}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>`
                : ''
            }
        </cac:Party>
    </cac:AccountingCustomerParty>

    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="SAR">${payload.vatAmountSar.toFixed(2)}</cbc:TaxAmount>
    </cac:TaxTotal>

    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="SAR">${payload.amountSar.toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="SAR">${payload.amountSar.toFixed(2)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="SAR">${payload.totalAmountSar.toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="SAR">${payload.totalAmountSar.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    ${itemsXml}
</Invoice>`;
  }
}
