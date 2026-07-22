import { Injectable } from '@nestjs/common';

export interface LegalBriefInput {
  firmName: string;
  firmLicenseNumber: string;
  caseNumber: string;
  courtName: string;
  circuitName: string; // الدائرة القضائية
  plaintiffName: string; // المدعي
  defendantName: string; // المدعى عليه
  lawyerName: string;
  lawyerLicenseNumber: string;
  briefTitle: string; // عنوان المذكرة (مذكرة جوابية، لائحة اعتراضية...)
  facts: string[]; // وقائع الدعوى
  legalGrounds: string[]; // الأسباب والأسانيد الشرعية والنظامية
  requests: string[]; // الطلبات الختامية
}

@Injectable()
export class LegalTemplateGeneratorService {
  /**
   * توليد صيغة المذكرة الجوابية / اللائحة الاعتراضية بالأسلوب القضائي السعودي المعتمد
   */
  generateSaudiLegalBriefHtml(input: LegalBriefInput): string {
    const todayGregorian = new Date().toLocaleDateString('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const todayHijri = new Date().toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const factsListHtml = input.facts.map((f, i) => `<li><b>${i + 1}.</b> ${f}</li>`).join('');
    const groundsListHtml = input.legalGrounds.map((g, i) => `<li><b>${i + 1}.</b> ${g}</li>`).join('');
    const requestsListHtml = input.requests.map((r, i) => `<li><b>${i + 1}.</b> ${r}</li>`).join('');

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>${input.briefTitle} - القضية رقم ${input.caseNumber}</title>
    <style>
        body {
            font-family: 'Traditional Arabic', 'Amiri', 'Sakkal Majalla', serif;
            font-size: 18px;
            line-height: 1.8;
            color: #1a1a1a;
            margin: 40px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .bismillah {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 25px;
        }
        .court-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .case-info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
        }
        .case-info-table td {
            padding: 10px 15px;
            border: 1px solid #cbd5e1;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #0f2942;
            border-bottom: 1px solid #0f2942;
            padding-bottom: 5px;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        ul {
            list-style-type: none;
            padding-right: 10px;
        }
        li {
            margin-bottom: 10px;
        }
        .footer-signature {
            margin-top: 50px;
            float: left;
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>${input.firmName}</h2>
        <p style="font-size: 14px; color: #475569;">ترخيص وزارة العدل رقم: ${input.firmLicenseNumber}</p>
    </div>

    <div class="bismillah">بسم الله الرحمن الرحيم</div>

    <div class="court-title">
        فضيلة رئيس وأعضاء ${input.courtName} - ${input.circuitName} المحترمين
    </div>
    <p>السلام عليكم ورحمة الله وبركاته،، وبعد:</p>

    <p style="text-align: center; font-size: 22px; font-weight: bold; margin: 20px 0;">
        <u>الموضوع: ${input.briefTitle}</u>
    </p>

    <table class="case-info-table">
        <tr>
            <td><b>رقم الدعوى:</b> ${input.caseNumber}</td>
            <td><b>تاريخ التقديم:</b> ${todayHijri} (الموافق ${todayGregorian})</td>
        </tr>
        <tr>
            <td><b>المدعي:</b> ${input.plaintiffName}</td>
            <td><b>المدعى عليه:</b> ${input.defendantName}</td>
        </tr>
    </table>

    <div class="section-title">أولاً: الوقائع والأحداث</div>
    <ul>${factsListHtml}</ul>

    <div class="section-title">ثانياً: الأسباب والأسانيد الشرعية والنظامية</div>
    <ul>${groundsListHtml}</ul>

    <div class="section-title">ثالثاً: الطلبات الختامية</div>
    <p>بناءً على ما تقدم من أسباب شرعية ونظامية، نلتمس من فضيلتكم الموقرة الحكم بما يلي:</p>
    <ul>${requestsListHtml}</ul>

    <p style="margin-top: 30px;">والله ولي التوفيق والسداد،،</p>

    <div class="footer-signature">
        <p><b>مقدمه وكيل المدعي / المدعى عليه:</b></p>
        <p>المحامي: ${input.lawyerName}</p>
        <p>رقم الترخيص: ${input.lawyerLicenseNumber}</p>
        <p style="margin-top: 30px;">التوقيع: ____________________</p>
    </div>

</body>
</html>
    `;
  }
}
