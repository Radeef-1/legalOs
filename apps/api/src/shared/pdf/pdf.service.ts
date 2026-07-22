import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  async generateCaseReport(caseItem: any): Promise<Buffer> {
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595.27 841.89] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 250 >>
stream
BT
/F1 16 Tf
70 700 Td
(LegalOS Case Ledger Report) Tj
/F1 12 Tf
0 -30 Td
(Case Internal ID: ${caseItem.caseNumberInternal}) Tj
0 -20 Td
(Najiz Case ID: ${caseItem.najizCaseNumber || 'Not Linked'}) Tj
0 -20 Td
(Court: ${caseItem.courtName || 'N/A'}) Tj
0 -20 Td
(Type: ${caseItem.caseType}) Tj
0 -20 Td
(Status: ${caseItem.status}) Tj
0 -30 Td
(Generated on: ${new Date().toISOString()}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000311 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
610
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  }
}
