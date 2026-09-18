export type DayPlan = {
  day: string;
  subject?: string;
  teacher?: string;
  tasks: string[];
  optionalTasks?: string[];
  rest?: boolean;
  catchUp?: boolean;
};

export const subjects = [
  {
    name: "اللغة العربية",
    teacher: "محمد صلاح",
    description: "شرح · تدريبات · قواعد · واجب · مراجعة",
  },
  {
    name: "English",
    teacher: "مي ماجدي",
    description: "Vocabulary · Grammar · Skills · Writing",
  },
  {
    name: "التاريخ",
    teacher: "أحمد غنيم",
    description: "حكايات · تلخيص · أسئلة · واجب · مراجعة",
  },
  {
    name: "البرمجة والذكاء الاصطناعي",
    teacher: "محمد غنيم",
    description: "Learn · Practice · Questions · Review",
  },
];

export const weeklyPlan: Record<number, DayPlan> = {
  0: {
    day: "الأحد",
    subject: "English",
    teacher: "مي ماجدي",
    tasks: [
      "الجزء الثاني من المحاضرة",
      "التطبيق على المحاضرة",
      "مراجعة Vocabulary",
      "تدريب Writing",
    ],
  },

  1: {
    day: "الاثنين",
    subject: "البرمجة والذكاء الاصطناعي",
    teacher: "محمد غنيم",
    tasks: [
      "دراسة الجزء الأساسي من المحاضرة",
      "فهم المفاهيم الجديدة",
      "تطبيق عملي",
      "حل Questions",
    ],
  },

  2: {
    day: "الثلاثاء",
    subject: "التاريخ",
    teacher: "أحمد غنيم",
    tasks: [
      "مشاهدة الحكايات",
      "تلخيص المحاضرة",
      "حل أسئلة التركيز",
      "إنهاء الواجب",
    ],
  },

  3: {
    day: "الأربعاء",
    subject: "English",
    teacher: "مي ماجدي",
    tasks: [
      "الجزء الأول من المحاضرة",
      "تسجيل الكلمات والملاحظات المهمة",
    ],
    optionalTasks: [
      "تطبيق برمجة وتثبيت ما تم شرحه يوم الاثنين",
    ],
  },

  4: {
    day: "الخميس",
    tasks: [],
    catchUp: true,
  },

  5: {
    day: "الجمعة",
    tasks: [],
    rest: true,
  },

  6: {
    day: "السبت",
    subject: "اللغة العربية",
    teacher: "محمد صلاح",
    tasks: [
      "دراسة المحاضرة",
      "تسجيل النقاط المهمة",
      "حل التدريبات",
      "إنهاء الواجب",
    ],
  },
};