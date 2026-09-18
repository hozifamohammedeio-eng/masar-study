import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";

type WeeklySnapshot = {
  totalStudyMinutes?: number;
  sessionsCount?: number;

  subjects?: {
    name: string;
    studyMinutes: number;
    sessions: number;
  }[];

  tasks?: {
    total: number;
    completed: number;
    overdue: number;
  };

  grades?: {
    subject: string;
    type: string;
    score: number;
    total: number;
  }[];

  weakPoints?: {
    subject: string;
    lesson?: string;
    note: string;
    priority: string;
  }[];
};

export async function POST(
  request: NextRequest
) {
  const apiKey =
    process.env.GEMINI_API_KEY;

  const correctCode =
    process.env.MASAR_AI_CODE;

  if (!apiKey || !correctCode) {
    return NextResponse.json(
      {
        error:
          "إعدادات الذكاء الاصطناعي غير مكتملة.",
      },
      {
        status: 500,
      }
    );
  }

  const enteredCode =
    request.headers.get(
      "x-masar-ai-code"
    );

  if (
    !enteredCode ||
    enteredCode !== correctCode
  ) {
    return NextResponse.json(
      {
        error:
          "كود الوصول غير صحيح.",
      },
      {
        status: 401,
      }
    );
  }

  let body: {
    snapshot?: WeeklySnapshot;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "البيانات غير صالحة.",
      },
      {
        status: 400,
      }
    );
  }

  if (!body.snapshot) {
    return NextResponse.json(
      {
        error:
          "مفيش بيانات للتحليل.",
      },
      {
        status: 400,
      }
    );
  }

  const prompt = `
أنت المساعد الدراسي الذكي داخل تطبيق اسمه "مسار".

حلل بيانات المذاكرة التالية واكتب تقريرًا أسبوعيًا بالعربية المصرية الواضحة.

قواعد مهمة جدًا:
- استخدم فقط البيانات الموجودة.
- ممنوع اختراع أرقام أو درجات أو معلومات.
- لو البيانات قليلة، قل إن البيانات غير كافية.
- التقرير يكون مختصر وعملي.
- لا تبالغ في المدح أو النقد.
- ركز على الأولويات العملية للأسبوع القادم.

أرجع النتيجة JSON فقط بالشكل التالي:

{
  "summary": "ملخص الأسبوع",
  "wins": ["نقطة إيجابية"],
  "concerns": ["نقطة تحتاج اهتمام"],
  "nextWeekPriorities": ["أولوية للأسبوع القادم"],
  "suggestedPlan": [
    {
      "subject": "اسم المادة",
      "action": "اقتراح عملي"
    }
  ]
}

بيانات الطالب:

${JSON.stringify(
  body.snapshot,
  null,
  2
)}
`;

  try {
    const response =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey,
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.2,

              responseMimeType:
                "application/json",
            },
          }),
        }
      );

    if (!response.ok) {
      console.error(
        "Gemini error:",
        response.status
      );

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "وصلنا لحد الاستخدام المجاني مؤقتًا. جرّب بعد شوية.",
          },
          {
            status: 429,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "Gemini مقدرش يعمل التقرير دلوقتي.",
        },
        {
          status: 502,
        }
      );
    }

    const data =
      await response.json();

    const text =
      data?.candidates?.[0]
        ?.content?.parts?.[0]?.text;

    if (
      !text ||
      typeof text !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Gemini مرجعش تقرير صالح.",
        },
        {
          status: 502,
        }
      );
    }

    const report =
      JSON.parse(text);

    return NextResponse.json({
      report,
      generatedAt:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "حصل خطأ أثناء إنشاء التقرير.",
      },
      {
        status: 500,
      }
    );
  }
}