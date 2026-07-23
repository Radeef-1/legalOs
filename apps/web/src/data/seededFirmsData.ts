export interface Lawyer {
  id: string;
  name: string;
  email: string;
  title: string;
  licenseNumber: string;
  casesCount: number;
}

export interface LawFirm {
  id: string;
  name: string;
  slug: string;
  cr: string;
  unn: string;
  city: string;
  lawyers: Lawyer[];
}

export interface CaseRecord {
  id: string;
  firmId: string;
  firmName: string;
  caseNumberInternal: string;
  najizCaseNumber: string;
  caseType: 'commercial' | 'labor' | 'personal_status' | 'execution';
  courtName: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  clientName: string;
  lawyerName: string;
  lawyerEmail: string;
  openedAt: string;
  claimAmount: string;
}

const courts = [
  'المحكمة التجارية بالرياض - الدائرة الأولى',
  'المحكمة التجارية بجدة - الدائرة الثالثة',
  'المحكمة العمالية بالرياض - الدائرة الثانية',
  'محكمة الأحوال الشخصية بالدمام - الدائرة الأولى',
  'محكمة التنفيذ بالرياض - الدائرة الخامسة',
  'محكمة الاستئناف بالرياض - دائرة العقود والشركات',
  'المحكمة العامة بالخبر - الدائرة المدنية',
];

const caseTypes: Array<'commercial' | 'labor' | 'personal_status' | 'execution'> = [
  'commercial',
  'labor',
  'personal_status',
  'execution',
];

const caseStatuses: Array<'open' | 'in_progress' | 'resolved' | 'closed'> = [
  'open',
  'in_progress',
  'resolved',
  'closed',
];

// Generate 3 Law Firms, 5 Lawyers each, and 15 Cases per Lawyer (225 Cases Total)
export const SEEDED_FIRMS: LawFirm[] = [
  {
    id: 'firm-1',
    name: 'مكتب السلمان للمحاماة والاستشارات القانونية',
    slug: 'firm-salman',
    cr: '1010894512',
    unn: '7001928475',
    city: 'الرياض',
    lawyers: [
      { id: 'l-1-1', name: 'د. عبد الله السلمان', email: 'salman.partner@salman-law.sa', title: 'شريك رئيسي / مستشار كبار', licenseNumber: 'SA-LAW-2026-1199', casesCount: 15 },
      { id: 'l-1-2', name: 'أ. فيصل السلمان', email: 'faisal@salman-law.sa', title: 'محامي شريك', licenseNumber: 'SA-LAW-2026-1299', casesCount: 15 },
      { id: 'l-1-3', name: 'أ. سارة الشمري', email: 'sara@salman-law.sa', title: 'مستشارة قضايا تجارية', licenseNumber: 'SA-LAW-2026-1399', casesCount: 15 },
      { id: 'l-1-4', name: 'أ. محمد القحطاني', email: 'mohammed@salman-law.sa', title: 'محامي استئناف ومحاكم', licenseNumber: 'SA-LAW-2026-1499', casesCount: 15 },
      { id: 'l-1-5', name: 'أ. نورة العتيبي', email: 'nora@salman-law.sa', title: 'محامية قضايا عمالية', licenseNumber: 'SA-LAW-2026-1599', casesCount: 15 },
    ],
  },
  {
    id: 'firm-2',
    name: 'شركة العدل والرقابة الدولية للمحاماة',
    slug: 'firm-adl',
    cr: '4030192847',
    unn: '7005829102',
    city: 'جدة',
    lawyers: [
      { id: 'l-2-1', name: 'أ. عبد العزيز الغامدي', email: 'ghamdi@adl-law.sa', title: 'شريك مدير', licenseNumber: 'SA-LAW-2026-2199', casesCount: 15 },
      { id: 'l-2-2', name: 'أ. خالد الزهراني', email: 'khalid@adl-law.sa', title: 'مستشار شركات وعقود', licenseNumber: 'SA-LAW-2026-2299', casesCount: 15 },
      { id: 'l-2-3', name: 'أ. ماجد الشهري', email: 'majed@adl-law.sa', title: 'محامي قضايا عمالية', licenseNumber: 'SA-LAW-2026-2399', casesCount: 15 },
      { id: 'l-2-4', name: 'أ. ريم الدوسري', email: 'reem@adl-law.sa', title: 'مستشارة تحكيم ودعاوى', licenseNumber: 'SA-LAW-2026-2499', casesCount: 15 },
      { id: 'l-2-5', name: 'أ. سلطان الحربي', email: 'sultan@adl-law.sa', title: 'محامي محاكم تنفيذ', licenseNumber: 'SA-LAW-2026-2599', casesCount: 15 },
    ],
  },
  {
    id: 'firm-3',
    name: 'مكتب التميمي والرويس محامون ومستشارون',
    slug: 'firm-tamimi',
    cr: '2050981234',
    unn: '7009128374',
    city: 'الدمام',
    lawyers: [
      { id: 'l-3-1', name: 'أ. طارق التميمي', email: 'tamimi@tamimi-law.sa', title: 'شريك مؤسس', licenseNumber: 'SA-LAW-2026-3199', casesCount: 15 },
      { id: 'l-3-2', name: 'أ. بدر الرويس', email: 'ruwais@tamimi-law.sa', title: 'شريك إدارة وقضايا', licenseNumber: 'SA-LAW-2026-3299', casesCount: 15 },
      { id: 'l-3-3', name: 'أ. ياسر الخالدي', email: 'yasser@tamimi-law.sa', title: 'مستشار أحوال شخصية وتركات', licenseNumber: 'SA-LAW-2026-3399', casesCount: 15 },
      { id: 'l-3-4', name: 'أ. هند المطيري', email: 'hind@tamimi-law.sa', title: 'محامية دعاوى تجارية', licenseNumber: 'SA-LAW-2026-3499', casesCount: 15 },
      { id: 'l-3-5', name: 'أ. فهد المطيري', email: 'fahad@tamimi-law.sa', title: 'محامي ترافع ومحاكم', licenseNumber: 'SA-LAW-2026-3599', casesCount: 15 },
    ],
  },
  {
    id: 'firm-demo',
    name: 'مكتب العتيبي للمحاماة والاستشارات القانونية والشرعية',
    slug: 'firm-demo',
    cr: '1010998877',
    unn: '7009988776',
    city: 'الرياض',
    lawyers: [
      { id: 'l-demo-1', name: 'د. عبد الرحمن بن فهد العتيبي', email: 'demo@demo22.com', title: 'شريك رئيسي / المدير التنفيذي', licenseNumber: 'SA-LAW-2026-9900', casesCount: 25 },
      { id: 'l-demo-2', name: 'أ. سارة بنت خالد العتيبي', email: 'sara@lawfirm.sa', title: 'مستشارة عقود وتجاري', licenseNumber: 'SA-LAW-2026-9911', casesCount: 15 },
    ],
  },
];

export const generateSeededCases = (): CaseRecord[] => {
  const allCases: CaseRecord[] = [];
  let globalCaseId = 1;

  SEEDED_FIRMS.forEach((firm, fIdx) => {
    firm.lawyers.forEach((lawyer, lIdx) => {
      for (let c = 1; c <= 15; c++) {
        const caseType = caseTypes[(c - 1) % caseTypes.length];
        const status = caseStatuses[(c - 1) % caseStatuses.length];
        const court = courts[(c - 1) % courts.length];
        const caseNumInternal = `CAS-${firm.slug.substring(5).toUpperCase()}-L${lIdx + 1}-${c.toString().padStart(2, '0')}`;
        const najizNum = `44901${fIdx + 1}${lIdx + 1}${c.toString().padStart(2, '0')}`;
        const claimAmt = (50000 + c * 35000 + fIdx * 120000).toLocaleString('ar-SA') + ' ر.س';

        allCases.push({
          id: `case-${globalCaseId++}`,
          firmId: firm.id,
          firmName: firm.name,
          caseNumberInternal: caseNumInternal,
          najizCaseNumber: najizNum,
          caseType,
          courtName: court,
          status,
          clientName: `شركة/مؤسسة الموكل ${c} - ${firm.city}`,
          lawyerName: lawyer.name,
          lawyerEmail: lawyer.email,
          openedAt: `2026-0${(c % 6) + 1}-12`,
          claimAmount: claimAmt,
        });
      }
    });
  });

  return allCases;
};

export const ALL_225_CASES = generateSeededCases();
