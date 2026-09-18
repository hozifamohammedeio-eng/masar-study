export type CurriculumLesson = {
  id: string;
  title: string;
};

export type CurriculumUnit = {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
};

export type SubjectCurriculum = {
  id: string;
  name: string;
  teacher: string;
  units: CurriculumUnit[];
};

export const curriculum: SubjectCurriculum[] = [
  // ==================================================
  // ARABIC
  // ==================================================
  {
    id: "arabic",
    name: "اللغة العربية",
    teacher: "محمد صلاح",

    units: [
      {
        id: "arabic-unit-1",
        title: "الوحدة الأولى — العلم والضمير",

        lessons: [
          {
            id: "arabic-1-1",
            title: "العلم بين القانون والضمير",
          },
          {
            id: "arabic-1-2",
            title: "الخلق جوهر الفضيلة",
          },
          {
            id: "arabic-1-3",
            title: "نص شعري — العلم نور",
          },
        ],
      },

      {
        id: "arabic-unit-2",
        title: "الوحدة الثانية — سلطان الكلمة الرقمية",

        lessons: [
          {
            id: "arabic-2-1",
            title: "التقنية وصناعة الرأي العام",
          },
          {
            id: "arabic-2-2",
            title: "بين الذوق والعقل",
          },
          {
            id: "arabic-2-3",
            title: "نص شعري — أثر الكلمة وحفظ اللسان",
          },
        ],
      },

      {
        id: "arabic-unit-3",
        title: "الوحدة الثالثة — الإنسان وكرامته",

        lessons: [
          {
            id: "arabic-3-1",
            title: "حقوق الإنسان بين العالمية والخصوصية",
          },
          {
            id: "arabic-3-2",
            title: "الحرية الفكرية",
          },
          {
            id: "arabic-3-3",
            title: "نص شعري — يا أخي الإنسان",
          },
        ],
      },
    ],
  },

  // ==================================================
  // ENGLISH
  // ==================================================
  {
    id: "english",
    name: "English",
    teacher: "مي ماجدي",

    units: [
      {
        id: "english-unit-1",
        title: "Unit 1 — Living Well in a Complex World",

        lessons: [
          {
            id: "english-1-1",
            title: "Social Media and Self-Image",
          },
          {
            id: "english-1-2",
            title: "Exploring Modern Lifestyles",
          },
          {
            id: "english-1-3",
            title: "Whose Responsibility Is It?",
          },
          {
            id: "english-1-4",
            title: "Understanding Mental Health",
          },
        ],
      },

      {
        id: "english-unit-2",
        title: "Unit 2 — Leisure Time",

        lessons: [
          {
            id: "english-2-1",
            title: "Screen Time and Young People",
          },
          {
            id: "english-2-2",
            title: "Creative Arts as Leisure Activities",
          },
          {
            id: "english-2-3",
            title: "Sport and Physical Activity as Leisure",
          },
          {
            id: "english-2-4",
            title: "Not Exactly a Relaxing Day",
          },
        ],
      },

      {
        id: "english-unit-3",
        title: "Unit 3 — Echoes of the Past",

        lessons: [
          {
            id: "english-3-1",
            title: "Sites of Memory",
          },
          {
            id: "english-3-2",
            title: "The Museum as a Storyteller",
          },
          {
            id: "english-3-3",
            title: "The Visual Past",
          },
          {
            id: "english-3-4",
            title: "Social Media and Historical Events",
          },
        ],
      },

      {
        id: "english-unit-4",
        title: "Unit 4 — The Power of Choice",

        lessons: [
          {
            id: "english-4-1",
            title: "Food Waste",
          },
          {
            id: "english-4-2",
            title: "Beyond the Brand",
          },
          {
            id: "english-4-3",
            title: "Digital Consumption",
          },
          {
            id: "english-4-4",
            title: "Black Friday and Sales Culture",
          },
        ],
      },

      {
        id: "english-unit-5",
        title: "Unit 5 — The Greenhouse Effect",

        lessons: [
          {
            id: "english-5-1",
            title: "The Climate Crisis",
          },
          {
            id: "english-5-2",
            title: "Renewable Energy — Powering a Sustainable Future",
          },
          {
            id: "english-5-3",
            title: "Greening Projects in Egypt",
          },
          {
            id: "english-5-4",
            title: "Individual and Collective Actions",
          },
        ],
      },

      {
        id: "english-novel",
        title: "Novel — The Lost World",

        lessons: [
          {
            id: "novel-1",
            title: "Chapter 1 — A Dream of Adventure",
          },
          {
            id: "novel-2",
            title: "Chapter 2 — Professor Challenger's Secret",
          },
          {
            id: "novel-3",
            title: "Chapter 3 — The Expedition Is Chosen",
          },
          {
            id: "novel-4",
            title: "Chapter 4 — Into the Unknown",
          },
          {
            id: "novel-5",
            title: "Chapter 5 — Trapped in the Lost World",
          },
          {
            id: "novel-6",
            title: "Chapter 6 — Malone's Night Adventure",
          },
          {
            id: "novel-7",
            title: "Chapter 7 — Prisoners of the Ape-Men",
          },
          {
            id: "novel-8",
            title: "Chapter 8 — The Battle for the Plateau",
          },
          {
            id: "novel-9",
            title: "Chapter 9 — The Hidden Way Home",
          },
          {
            id: "novel-10",
            title: "Chapter 10 — Proof Before the World",
          },
        ],
      },
    ],
  },

  // ==================================================
  // HISTORY
  // ==================================================
  {
    id: "history",
    name: "التاريخ",
    teacher: "أحمد غنيم",

    units: [
      {
        id: "history-unit-1",
        title: "الوحدة الأولى — مصر بين الماضي والحاضر",

        lessons: [
          {
            id: "history-1-1",
            title: "بناء الدولة المصرية واستمرارها عبر التاريخ",
          },
          {
            id: "history-1-2",
            title: "الدولة المصرية القديمة ومقاومة الاحتلال",
          },
          {
            id: "history-1-3",
            title: "التحولات الكبرى في مصر — العصر الوسيط",
          },
          {
            id: "history-1-4",
            title: "التحولات الكبرى في مصر — العصر الحديث",
          },
        ],
      },

      {
        id: "history-unit-2",
        title:
          "الوحدة الثانية — تحولات القوة وبناء الوعي بمصر في العصر الحديث والمعاصر",

        lessons: [
          {
            id: "history-2-1",
            title: "سياسات الاحتلال بمصر في العصر الحديث",
          },
          {
            id: "history-2-2",
            title: "صمود الشعب المصري ومقاومة الاحتلال",
          },
          {
            id: "history-2-3",
            title: "ثورة 23 يوليو والتحولات الكبرى في مصر",
          },
          {
            id: "history-2-4",
            title: "الهوية الوطنية في مواجهة الاستعمار الجديد",
          },
        ],
      },

      {
        id: "history-unit-3",
        title:
          "الوحدة الثالثة — مصر وقضايا التحرر الوطني في الوطن العربي وإفريقيا",

        lessons: [
          {
            id: "history-3-1",
            title:
              "حركات التحرر الوطني ضد الاحتلال الفرنسي والإيطالي في العالم العربي",
          },
          {
            id: "history-3-2",
            title:
              "حركات التحرر الوطني ضد الاحتلال البريطاني والإسباني في العالم العربي",
          },
          {
            id: "history-3-3",
            title: "مرتكزات الدور المصري إقليميًا ودوليًا",
          },
          {
            id: "history-3-4",
            title: "دور مصر في دعم حركات التحرر الوطني",
          },
        ],
      },
    ],
  },

  // ==================================================
  // PROGRAMMING & AI
  // ==================================================
  {
    id: "programming",
    name: "البرمجة والذكاء الاصطناعي",
    teacher: "محمد غنيم",

    units: [
      {
        id: "programming-chapter-1",
        title: "Chapter 1 — تكنولوجيا المعلومات والمجتمع",

        lessons: [
          {
            id: "programming-1-1",
            title: "تطور تكنولوجيا المعلومات والتحول الاجتماعي",
          },
          {
            id: "programming-1-2",
            title: "كيف يعمل الذكاء الاصطناعي",
          },
          {
            id: "programming-1-3",
            title:
              "الذكاء الاصطناعي في الحياة اليومية والصناعة",
          },
          {
            id: "programming-1-4",
            title: "القضايا الأخلاقية للذكاء الاصطناعي",
          },
        ],
      },

      {
        id: "programming-chapter-2",
        title: "Chapter 2 — الأمن السيبراني",

        lessons: [
          {
            id: "programming-2-1",
            title: "تقنيات التشفير والمصادقة",
          },
          {
            id: "programming-2-2",
            title: "تصميم أمن الشبكات",
          },
          {
            id: "programming-2-3",
            title: "الاستجابة للحوادث وإدارة المخاطر",
          },
        ],
      },

      {
        id: "programming-chapter-3",
        title: "Chapter 3 — تطبيقات الويب",

        lessons: [
          {
            id: "programming-3-1",
            title: "البنية العامة لتطبيقات الويب",
          },
          {
            id: "programming-3-2",
            title: "طرق الاتصال في تطبيقات الويب",
          },
          {
            id: "programming-3-3",
            title: "أساسيات تكنولوجيا الواجهة الأمامية",
          },
        ],
      },

      {
        id: "programming-chapter-4",
        title: "Chapter 4 — تصميم الويب والوسائط",

        lessons: [
          {
            id: "programming-4-1",
            title: "أنواع الوسائط وخصائصها",
          },
          {
            id: "programming-4-2",
            title: "تصميم المعلومات وتجربة المستخدم للمواقع",
          },
          {
            id: "programming-4-3",
            title: "أساليب تقييم المواقع الإلكترونية",
          },
          {
            id: "programming-4-4",
            title: "عملية التحسين التكراري للمواقع",
          },
        ],
      },
    ],
  },
];