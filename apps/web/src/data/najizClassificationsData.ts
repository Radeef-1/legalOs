export interface NajizSubCategory {
  id: string;
  name: string;
  courtName: string;
  mainCategoryName: string;
  description?: string;
  legalBasis?: string;
}

export interface NajizMainCategory {
  id: string;
  name: string;
  subCategories: NajizSubCategory[];
}

export interface NajizCourtJurisdiction {
  id: string;
  name: string;
  mainCategories: NajizMainCategory[];
}

export const NAJIZ_OFFICIAL_CLASSIFICATIONS: NajizCourtJurisdiction[] = [
  {
    id: "personal_status",
    name: "أولاً: محاكم الأحوال الشخصية (نظام الأحوال الشخصية)",
    mainCategories: [
      {
        id: "ps_general",
        name: "التصنيف العام للدعاوى التابعة لمسائل الأحوال الشخصية",
        subCategories: [
          { id: "ps_1", name: "دعوى إثبات رضاع أو مصاهرة", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام", legalBasis: "نظام الأحوال الشخصية" },
          { id: "ps_2", name: "دعوى إقامة حارس قضائي على تركة أو وقف", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام", legalBasis: "المادة 33 - نظام المرافعات الشرعية" },
          { id: "ps_3", name: "دعوى تعويض عن الأضرار الناتجة في مسائل الأحوال الشخصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام" },
          { id: "ps_4", name: "دعوى مطالبة بأتعاب محامين أو وكلاء في قضايا الأحوال الشخصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام" },
          { id: "ps_5", name: "دعوى مطالبة بمستندات رسمية (زوجة، أولاد، تركة)", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام" },
          { id: "ps_6", name: "دعوى معارضة على صك إنهاء بعد ثبوتها", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام" },
          { id: "ps_7", name: "دعوى منع من السفر متعلقة بحق أحوال شخصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام" },
          { id: "ps_8", name: "دعوى هبة أو رجوع عنها بين الزوجين أو الورثة", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "التصنيف العام" },
        ],
      },
      {
        id: "ps_waqf",
        name: "دعاوى الأوقاف والوصايا",
        subCategories: [
          { id: "wq_1", name: "دعوى إابطال وقف أو وصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الأوقاف والوصايا" },
          { id: "wq_2", name: "دعوى إثبات وقف أو وصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الأوقاف والوصايا" },
          { id: "wq_3", name: "دعوى استحقاق في وقف أو وصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الأوقاف والوصايا" },
          { id: "wq_4", name: "دعوى عزل ناظر وقف أو وصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الأوقاف والوصايا" },
          { id: "wq_5", name: "دعوى محاسبة ناظر وقف أو وصية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الأوقاف والوصايا" },
        ],
      },
      {
        id: "ps_custody",
        name: "دعاوى الحضانة والزيارة والنفقة",
        subCategories: [
          { id: "cs_1", name: "دعوى أجرة رضاع أو حضانة", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
          { id: "cs_2", name: "دعوى تسليم صغير لحاضنه", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
          { id: "cs_3", name: "دعوى حضانة الأبناء القاصرين", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
          { id: "cs_4", name: "دعوى رؤية صغير", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
          { id: "cs_5", name: "زيادة نفقة أو إنقاصها أو إلغاؤها", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
          { id: "cs_6", name: "دعوى زيارة أولاد أو غيرهم", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
          { id: "cs_7", name: "دعوى نفقة (ماضية أو مستقبلية)", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الحضانة والزيارة والنفقة" },
        ],
      },
      {
        id: "ps_marriage",
        name: "دعاوى النكاح والفرقة",
        subCategories: [
          { id: "mr_1", name: "دعوى إثبات رجعة بعد الطلاق", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
          { id: "mr_2", name: "دعوى إثبات طلاق وقع في الماضي", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
          { id: "mr_3", name: "دعوى إثبات نكاح غير موثق", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
          { id: "mr_4", name: "دعوى خلع بعوض", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
          { id: "mr_5", name: "دعوى مطالبة بالصداق (المهر)", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
          { id: "mr_6", name: "دعوى عفش الزوجية والمنقولات", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
          { id: "mr_7", name: "فسخ نكاح لملسوغ شرعي", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "النكاح والفرقة" },
        ],
      },
      {
        id: "ps_guardianship",
        name: "دعاوى الولاية والنسب",
        subCategories: [
          { id: "gd_1", name: "دعوى إثبات نسب أو نفيه", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الولاية والنسب" },
          { id: "gd_2", name: "دعوى إذن سفر للقاصر", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الولاية والنسب" },
          { id: "gd_3", name: "دعوى حجر على السفيه أو رفعه", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الولاية والنسب" },
          { id: "gd_4", name: "دعوى عزل ولي على قاصر", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الولاية والنسب" },
          { id: "gd_5", name: "دعوى عضل امرأة ونقل ولاية التزويج", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الولاية والنسب" },
          { id: "gd_6", name: "دعوى محاسبة ولي على تصرفاته المالية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "الولاية والنسب" },
        ],
      },
      {
        id: "ps_estates",
        name: "دعاوى قسمة التركات",
        subCategories: [
          { id: "es_1", name: "دعوى قسمة تركة أكثر من 100 مليون ريال", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "قسمة التركات" },
          { id: "es_2", name: "دعوى قسمة تركة عقارية", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "قسمة التركات" },
          { id: "es_3", name: "دعوى قسمة تركة مالية (نقود وأسهم)", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "قسمة التركات" },
          { id: "es_4", name: "دعوى محاسبة وكيل وارث متصرف في التركة", courtName: "محكمة الأحوال الشخصية", mainCategoryName: "قسمة التركات" },
        ],
      },
    ],
  },
  {
    id: "execution",
    name: "ثانياً: محاكم التنفيذ (نظام التنفيذ والقرار 34/46)",
    mainCategories: [
      {
        id: "ex_insolvency",
        name: "دعاوى الإعسار والملاءة",
        subCategories: [
          { id: "ex_1", name: "دعوى إعسار لإثبات عدم القدرة على السداد", courtName: "محكمة التنفيذ", mainCategoryName: "الإعسار والملاءة" },
          { id: "ex_2", name: "دعوى ملاءة لإثبات قدرة المنفذ ضده على السداد", courtName: "محكمة التنفيذ", mainCategoryName: "الإعسار والملاءة" },
        ],
      },
      {
        id: "ex_formal_disputes",
        name: "منازعات شكلية في السند التنفيذي",
        subCategories: [
          { id: "ex_f1", name: "عدم توفر شرط شكلي للسند أو تزويره أو إنكار التوقيع", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات شكلية" },
          { id: "ex_f2", name: "دعوى عدم الصفة لطالب التنفيذ أو المنفذ ضده", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات شكلية" },
        ],
      },
      {
        id: "ex_substantive_disputes",
        name: "منازعات غير شكلية بعد صدور السند التنفيذي",
        subCategories: [
          { id: "ex_s1", name: "إثبات الإبراء أو التنازل بعد صدور السند", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s2", name: "إثبات التأجيل أو إمهال الحق", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s3", name: "إثبات حوالة الحق على طرف ثالث", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s4", name: "إثبات الصلح بعد صدور السند التنفيذي", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s5", name: "دعوى المال المحجوز يفوق مقدار الدين المطالب به", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s6", name: "المقاصة بموجب سند تنفيذي آخر", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s7", name: "إثبات وفاء مبلغ المطالبة أو جزء منه", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s8", name: "امتناع شاغل العقار عن الإخلاء لحمله سنداً تنفيذياً", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s9", name: "التواطؤ أثناء المزاد العلني أو التأثير على السعر", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
          { id: "ex_s10", name: "دعوى التعويض عن أضرار التنفيذ (المنع من السفر والحجز التحفظي)", courtName: "محكمة التنفيذ", mainCategoryName: "منازعات غير شكلية" },
        ],
      },
    ],
  },
  {
    id: "criminal",
    name: "ثالثاً: المحاكم الجزائية (نظام الإجراءات الجزائية)",
    mainCategories: [
      {
        id: "cr_requests",
        name: "الطلبات القضائية الجزائية",
        subCategories: [
          { id: "cr_r1", name: "طلب منع من السفر قبل إقامة الدعوى الأصلية", courtName: "المحكمة الجزائية", mainCategoryName: "الطلبات القضائية" },
          { id: "cr_r2", name: "إثبات تنازل المجني عليه عن القصاص أو الحد", courtName: "المحكمة الجزائية", mainCategoryName: "الطلبات القضائية" },
        ],
      },
      {
        id: "cr_taazir",
        name: "جرائم التعزير",
        subCategories: [
          { id: "cr_t1", name: "إتلاف الممتلكات العامة والخاصة", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t2", name: "السحر والكهانة والشعوذة", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t3", name: "التشهير وتشويه السمعة", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t4", name: "الابتزاز والتهديد بالفضح", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t5", name: "التحرش (نظام مكافحة جريمة التحرش)", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t6", name: "الجرائم المعلوماتية (نظام مكافحة الجرائم المعلوماتية)", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t7", name: "النصب والاحتيال المالي", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t8", name: "خيانة الأمانة بالتعدي أو التفريط", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t9", name: "الدعوى الكيدية والشواهد الكاذبة", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
          { id: "cr_t10", name: "نظام الحماية من الإيذاء", courtName: "المحكمة الجزائية", mainCategoryName: "التعزير" },
        ],
      },
      {
        id: "cr_hudud",
        name: "دعاوى الحدود",
        subCategories: [
          { id: "cr_h1", name: "حد القذف (الرمي بالفاحشة تصريحاً أو كتابة)", courtName: "المحكمة الجزائية", mainCategoryName: "الحدود" },
          { id: "cr_h2", name: "حد السرقة (أخذ المال خفية)", courtName: "المحكمة الجزائية", mainCategoryName: "الحدود" },
        ],
      },
    ],
  },
  {
    id: "general",
    name: "رابعاً: المحاكم العامة والمرورية",
    mainCategories: [
      {
        id: "gn_realestate",
        name: "الدعاوى العقارية",
        subCategories: [
          { id: "re_1", name: "دعوى إخلاء عقار وإخراج واضع اليد", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_2", name: "دعوى استطراق وفتح طريق", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_3", name: "دعوى تداخل العقارات الجارة", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_4", name: "دعوى مطالبة بحق الشفعة", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_5", name: "دعوى إثبات ملكية عقار", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_6", name: "دعوى رفع اليد ضد الجهات الحكومية", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_7", name: "دعوى قسمة عقارات مشتركة (إجبار)", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_8", name: "دعوى المساهمات العقارية وتصفيتها", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
          { id: "re_9", name: "دعوى مقاولات إنشاء المباني والبناء والترميم", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى العقارية" },
        ],
      },
      {
        id: "gn_financial",
        name: "الدعاوى المالية والتعويضية",
        subCategories: [
          { id: "fn_1", name: "إثبات رهن أو بيع العين المرهونة", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_2", name: "دعوى التعويض عن الأضرار", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_3", name: "مطالبة برد مسروق أو بدله", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_4", name: "دعوى قرض أو سلف مالية", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_5", name: "مطالبة بأتعاب المحاماة بين الموكل ووكيله", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_6", name: "مطالبة بأجرة أعمال (تركيب/صيانة/نقل)", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_7", name: "مطالبة بأجرة عقار مملوكة منفعته", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_8", name: "مطالبة بأجرة عين منقولة (سيارات ومعدات)", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_9", name: "دعوى التعويض عن أضرار التقاضي والدعاوى الكيدية", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_10", name: "دعوى مطالبة بثمن مبيع ثابت أو منقول", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_11", name: "مطالبة الكفيل (الضامن) للمضمون عنه", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
          { id: "fn_12", name: "دعوى وديعة وأمانة حفظ أموال", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المالية" },
        ],
      },
      {
        id: "gn_traffic",
        name: "المنازعات والدعاوى المرورية",
        subCategories: [
          { id: "tr_1", name: "حق خاص ناشئ عن حادث مروري (إصابات أو أضرار مركبة)", courtName: "محكمة المرور", mainCategoryName: "الدعاوى المرورية" },
          { id: "tr_2", name: "حق عام ناشئ عن حادث مروري", courtName: "محكمة المرور", mainCategoryName: "الدعاوى المرورية" },
          { id: "tr_3", name: "أرش إصابة غير مرورية", courtName: "المحكمة العامة", mainCategoryName: "الدعاوى المرورية" },
        ],
      },
    ],
  },
  {
    id: "commercial",
    name: "خامساً: المحاكم التجارية (نظام المحاكم التجارية)",
    mainCategories: [
      {
        id: "cm_contracts",
        name: "المنازعات والعقود التجارية (المادة 19)",
        subCategories: [
          { id: "cm_1", name: "دعوى عقود التوريد والخدمات التجارية (المادة 19 - شرط الإخطار)", courtName: "المحكمة التجارية", mainCategoryName: "العقود والمنازعات" },
          { id: "cm_2", name: "منازعات الشركاء في الشركات التجارية", courtName: "المحكمة التجارية", mainCategoryName: "العقود والمنازعات" },
          { id: "cm_3", name: "دعوى الوكالات والامتياز التجاري (Franchise)", courtName: "المحكمة التجارية", mainCategoryName: "العقود والمنازعات" },
          { id: "cm_4", name: "دعاوى الملكية الفكرية وحماية العلامات التجارية", courtName: "المحكمة التجارية", mainCategoryName: "العقود والمنازعات" },
          { id: "cm_5", name: "دعاوى الإفلاس والتسوية الوقائية وإعادة التنظيم المالي", courtName: "المحكمة التجارية", mainCategoryName: "العقود والمنازعات" },
          { id: "cm_6", name: "منازعات المنافسة غير المشروعة والإغراق", courtName: "المحكمة التجارية", mainCategoryName: "العقود والمنازعات" },
        ],
      },
    ],
  },
  {
    id: "labor",
    name: "سادساً: المحاكم العمالية (نظام العمل)",
    mainCategories: [
      {
        id: "lb_contracts",
        name: "المنازعات العمالية (منصة قوى ومنصة تراضي Taradhi)",
        subCategories: [
          { id: "lb_1", name: "دعوى الأجور والمستحقات العمالية المتأخرة", courtName: "المحكمة العمالية", mainCategoryName: "المنازعات العمالية" },
          { id: "lb_2", name: "دعوى مكافأة نهاية الخدمة وبدل الإجازات", courtName: "المحكمة العمالية", mainCategoryName: "المنازعات العمالية" },
          { id: "lb_3", name: "دعوى التعويض عن الإنهاء غير المشروع (المادة 77)", courtName: "المحكمة العمالية", mainCategoryName: "المنازعات العمالية" },
          { id: "lb_4", name: "منازعات عقود العمل الموثقة عبر منصة قوى (Qiwa)", courtName: "المحكمة العمالية", mainCategoryName: "المنازعات العمالية" },
          { id: "lb_5", name: "دعوى الاعتراض على القرارات والجزاءات التأديبية", courtName: "المحكمة العمالية", mainCategoryName: "المنازعات العمالية" },
          { id: "lb_6", name: "دعاوى إصابات العمل والتعويضات التأمينية", courtName: "المحكمة العمالية", mainCategoryName: "المنازعات العمالية" },
        ],
      },
    ],
  },
  {
    id: "administrative",
    name: "سابعاً: المحاكم الإدارية - ديوان المظالم",
    mainCategories: [
      {
        id: "ad_contracts",
        name: "دعاوى ديوان المظالم والتظلم الإداري (60 يوماً)",
        subCategories: [
          { id: "ad_1", name: "دعوى إلغاء قرار إداري نهائي (التظلم الإداري المسبق)", courtName: "ديوان المظالم", mainCategoryName: "المحكمة الإدارية" },
          { id: "ad_2", name: "دعوى تعويض عن أعمال وإجراءات الجهات الحكومية", courtName: "ديوان المظالم", mainCategoryName: "المحكمة الإدارية" },
          { id: "ad_3", name: "منازعات العقود الإدارية والمشاريع الحكومية", courtName: "ديوان المظالم", mainCategoryName: "المحكمة الإدارية" },
          { id: "ad_4", name: "دعاوى الحقوق الوظيفية والتقاعد الحكومي", courtName: "ديوان المظالم", mainCategoryName: "المحكمة الإدارية" },
        ],
      },
    ],
  },
];

// Helper to flatten all subcategories for instant search
export const ALL_FLAT_NAJIZ_SUB_CATEGORIES: NajizSubCategory[] = NAJIZ_OFFICIAL_CLASSIFICATIONS.flatMap((court) =>
  court.mainCategories.flatMap((mc) => mc.subCategories)
);
