export type WorkflowStep = {
  id: string;
  title: string;
  description: string;
};

export type SubjectWorkflow = {
  subjectId: string;
  steps: WorkflowStep[];
};

export const subjectWorkflows: SubjectWorkflow[] = [
  {
    subjectId: "arabic",
    steps: [
      {
        id: "lecture",
        title: "شرح المحاضرة",
        description: "ذاكر شرح الدرس أو المحاضرة كاملة.",
      },
      {
        id: "notes",
        title: "الملاحظات",
        description: "اكتب أهم القواعد والأفكار والنقاط اللي محتاج تفتكرها.",
      },
      {
        id: "practice",
        title: "التدريبات",
        description: "حل تدريبات الدرس بنفسك.",
      },
      {
        id: "homework",
        title: "الواجب",
        description: "أنهِ الواجب المطلوب على الدرس.",
      },
      {
        id: "review",
        title: "المراجعة",
        description: "راجع القواعد والنصوص والأخطاء اللي وقعت فيها.",
      },
    ],
  },

  {
    subjectId: "english",
    steps: [
      {
        id: "vocabulary",
        title: "Vocabulary",
        description: "راجع الكلمات الجديدة ومعانيها واستخدامها.",
      },
      {
        id: "grammar",
        title: "Grammar",
        description: "افهم القاعدة وراجع الأمثلة الخاصة بها.",
      },
      {
        id: "skills",
        title: "Reading & Skills",
        description: "طبّق على القراءة والمهارات الموجودة في الدرس.",
      },
      {
        id: "writing",
        title: "Writing",
        description: "تدرّب على الجزء الكتابي المطلوب.",
      },
      {
        id: "questions",
        title: "Questions",
        description: "حل أسئلة على الدرس بدون الرجوع للإجابات.",
      },
      {
        id: "review",
        title: "Review",
        description: "راجع الأخطاء والكلمات أو القواعد اللي محتاجة تثبيت.",
      },
    ],
  },

  {
    subjectId: "history",
    steps: [
      {
        id: "lecture",
        title: "شرح الدرس",
        description: "شاهد أو ذاكر شرح الدرس كاملًا.",
      },
      {
        id: "stories",
        title: "تقسيم الدرس",
        description: "قسّم الدرس لأحداث أو حكايات صغيرة مترابطة.",
      },
      {
        id: "summary",
        title: "التلخيص",
        description: "لخّص أهم الأحداث والأسباب والنتائج في كشكولك.",
      },
      {
        id: "focus",
        title: "أسئلة التركيز",
        description: "جاوب على أسئلة تربط بين الأحداث والأسباب والنتائج.",
      },
      {
        id: "homework",
        title: "الواجب والأسئلة",
        description: "حل أسئلة الدرس والواجب المطلوب.",
      },
      {
        id: "review",
        title: "المراجعة",
        description: "راجع الأخطاء والنقاط اللي لسه مش ثابتة.",
      },
    ],
  },

  {
    subjectId: "programming",
    steps: [
      {
        id: "learn",
        title: "Learn",
        description: "ذاكر الجزء الجديد من الدرس.",
      },
      {
        id: "understand",
        title: "Understand",
        description: "تأكد إنك فاهم الفكرة مش حافظها بس.",
      },
      {
        id: "practice",
        title: "Practice",
        description: "طبّق الفكرة عمليًا بنفسك.",
      },
      {
        id: "questions",
        title: "Questions",
        description: "حل أسئلة على الجزء اللي اتعلمته.",
      },
      {
        id: "challenge",
        title: "Challenge",
        description: "جرّب تطبيق أو سؤال أصعب من المثال الأساسي.",
      },
      {
        id: "review",
        title: "Review",
        description: "راجع الأخطاء والنقاط اللي محتاجة تدريب تاني.",
      },
    ],
  },
];

export function getSubjectWorkflow(subjectId: string) {
  return (
    subjectWorkflows.find(
      (workflow) => workflow.subjectId === subjectId
    )?.steps ?? []
  );
}