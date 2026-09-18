"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type View =
  | "today"
  | "plan"
  | "subjects"
  | "timer"
  | "grades"
  | "analytics"
  | "settings";

type DayPlan = {
  day: string;
  subject?: string;
  teacher?: string;
  tasks: string[];
  optionalTasks?: string[];
  rest?: boolean;
  catchUp?: boolean;
};

type Grade = {
  id: string;
  subject: string;
  type: string;
  score: number;
  total: number;
  date: string;
};

const subjects = [
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

const weeklyPlan: Record<number, DayPlan> = {
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

const navigation: {
  id: View;
  label: string;
  symbol: string;
}[] = [
  { id: "today", label: "اليوم", symbol: "●" },
  { id: "plan", label: "خطتي", symbol: "□" },
  { id: "subjects", label: "المواد", symbol: "◫" },
  { id: "timer", label: "المؤقت", symbol: "◷" },
  { id: "grades", label: "الدرجات", symbol: "✓" },
  { id: "analytics", label: "التحليلات", symbol: "⌁" },
  { id: "settings", label: "الإعدادات", symbol: "⚙" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<View>("today");

  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);

  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusLoaded, setFocusLoaded] = useState(false);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(50);
  const [secondsLeft, setSecondsLeft] = useState(50 * 60);

  const [selectedSubject, setSelectedSubject] = useState(
    "اللغة العربية"
  );

  const [sessionGoal, setSessionGoal] = useState("");

  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradesLoaded, setGradesLoaded] = useState(false);

  const [gradeSubject, setGradeSubject] = useState(
    "اللغة العربية"
  );
  const [gradeType, setGradeType] = useState("Quiz");
  const [gradeScore, setGradeScore] = useState("");
  const [gradeTotal, setGradeTotal] = useState("");

  const [studentName, setStudentName] = useState("حذيفة");

  const now = new Date();

  const todayPlan = weeklyPlan[now.getDay()];

  const todayKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const formattedDate = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const greeting =
    now.getHours() < 12
      ? "صباح الخير"
      : now.getHours() < 18
        ? "مساء الخير"
        : "مساء الخير";

  useEffect(() => {
    const savedName = localStorage.getItem("masar-student-name");

    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(
      `masar-completed-tasks-${todayKey}`
    );

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCompletedTasks(parsed);
        }
      } catch {
        setCompletedTasks([]);
      }
    }

    setTasksLoaded(true);
  }, [todayKey]);

  useEffect(() => {
    if (!tasksLoaded) return;

    localStorage.setItem(
      `masar-completed-tasks-${todayKey}`,
      JSON.stringify(completedTasks)
    );
  }, [completedTasks, tasksLoaded, todayKey]);

  useEffect(() => {
    const saved = localStorage.getItem(
      `masar-focus-seconds-${todayKey}`
    );

    if (saved) {
      const parsed = Number(saved);

      if (!Number.isNaN(parsed)) {
        setFocusSeconds(parsed);
      }
    }

    setFocusLoaded(true);
  }, [todayKey]);

  useEffect(() => {
    if (!focusLoaded) return;

    localStorage.setItem(
      `masar-focus-seconds-${todayKey}`,
      String(focusSeconds)
    );
  }, [focusSeconds, focusLoaded, todayKey]);

  useEffect(() => {
    const saved = localStorage.getItem("masar-grades");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setGrades(parsed);
        }
      } catch {
        setGrades([]);
      }
    }

    setGradesLoaded(true);
  }, []);

  useEffect(() => {
    if (!gradesLoaded) return;

    localStorage.setItem(
      "masar-grades",
      JSON.stringify(grades)
    );
  }, [grades, gradesLoaded]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }

        setFocusSeconds((focus) => focus + 1);

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const progress = useMemo(() => {
    if (!todayPlan.tasks.length) return 0;

    return Math.round(
      (completedTasks.length / todayPlan.tasks.length) * 100
    );
  }, [completedTasks, todayPlan.tasks.length]);

  const gradeAverage = useMemo(() => {
    if (grades.length === 0) return null;

    const percentages = grades.map(
      (grade) => (grade.score / grade.total) * 100
    );

    return Math.round(
      percentages.reduce((a, b) => a + b, 0) /
        percentages.length
    );
  }, [grades]);

  function toggleTask(index: number) {
    setCompletedTasks((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  function changeTimerDuration(minutes: number) {
    if (timerRunning) return;

    setTimerMinutes(minutes);
    setSecondsLeft(minutes * 60);
  }

  function startTodaySession() {
    if (todayPlan.subject) {
      setSelectedSubject(todayPlan.subject);
    }

    const incomplete = todayPlan.tasks.find(
      (_, index) => !completedTasks.includes(index)
    );

    setSessionGoal(incomplete ?? "");
    setActiveView("timer");
  }

  function resetTimer() {
    setTimerRunning(false);
    setSecondsLeft(timerMinutes * 60);
  }

  function formatTimer(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  function formatFocusTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);

    if (minutes === 0) return "0 دقيقة";

    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (remaining === 0) {
      return `${hours} ساعة`;
    }

    return `${hours} س ${remaining} د`;
  }

  function addGrade(event: FormEvent) {
    event.preventDefault();

    const score = Number(gradeScore);
    const total = Number(gradeTotal);

    if (
      !gradeScore ||
      !gradeTotal ||
      total <= 0 ||
      score < 0 ||
      score > total
    ) {
      return;
    }

    const newGrade: Grade = {
      id: `${Date.now()}`,
      subject: gradeSubject,
      type: gradeType,
      score,
      total,
      date: new Date().toISOString(),
    };

    setGrades((current) => [newGrade, ...current]);

    setGradeScore("");
    setGradeTotal("");
  }

  function deleteGrade(id: string) {
    setGrades((current) =>
      current.filter((grade) => grade.id !== id)
    );
  }

  function saveStudentName() {
    const trimmed = studentName.trim();

    if (!trimmed) return;

    localStorage.setItem("masar-student-name", trimmed);
  }

  function renderToday() {
    return (
      <>
        <PageHeader
          eyebrow={formattedDate}
          title={`${greeting} يا ${studentName}`}
          subtitle="دي خطتك لليوم. ركّز على الخطوة اللي قدامك."
        />

        {todayPlan.rest && (
          <section className="rounded-[32px] bg-[#1D1D1F] p-7 text-white sm:p-10">
            <p className="text-sm text-[#A1A1A6]">
              الجمعة
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              يوم الراحة
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#A1A1A6]">
              مفيش مهام مذاكرة أساسية النهارده.
            </p>

            <div className="mt-8 rounded-[22px] bg-white/10 p-5">
              <p className="text-sm font-medium">
                التقرير الأسبوعي
              </p>

              <p className="mt-2 text-sm text-[#A1A1A6]">
                هيظهر لما يبقى فيه بيانات كافية من استخدامك.
              </p>
            </div>
          </section>
        )}

        {todayPlan.catchUp && (
          <section className="rounded-[32px] bg-white p-7 sm:p-10">
            <p className="text-sm font-medium text-[#0071E3]">
              Catch-up
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              يوم المراجعة والتراكمات
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#6E6E73]">
              مفيش مادة ثابتة النهارده. لما نضيف نظام
              التراكمات هتظهر المهام المتأخرة هنا تلقائيًا.
            </p>
          </section>
        )}

        {!todayPlan.rest && !todayPlan.catchUp && (
          <div className="grid gap-5 xl:grid-cols-[1.55fr_0.75fr]">
            <section className="overflow-hidden rounded-[32px] bg-white">
              <div className="border-b border-[#ECECEF] p-6 sm:p-8">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="mb-5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#0071E3]" />

                      <span className="text-xs font-medium text-[#0071E3]">
                        خطة اليوم
                      </span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-black">
                      {todayPlan.subject}
                    </h2>

                    <p className="mt-2 text-sm text-[#86868B]">
                      {todayPlan.teacher}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      مهام اليوم
                    </p>

                    <p className="mt-1 text-xs text-[#86868B]">
                      تقدمك بيتحفظ تلقائيًا
                    </p>
                  </div>

                  <span className="text-sm text-[#6E6E73]">
                    {completedTasks.length}/
                    {todayPlan.tasks.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {todayPlan.tasks.map((task, index) => {
                    const completed =
                      completedTasks.includes(index);

                    return (
                      <button
                        key={task}
                        type="button"
                        onClick={() => toggleTask(index)}
                        className={`flex w-full items-center gap-4 rounded-[18px] border px-4 py-4 text-right transition ${
                          completed
                            ? "border-transparent bg-[#F5F5F7]"
                            : "border-[#ECECEF] hover:border-[#D2D2D7] hover:bg-[#FAFAFA]"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            completed
                              ? "border-[#0071E3] bg-[#0071E3] text-white"
                              : "border-[#C7C7CC]"
                          }`}
                        >
                          {completed ? "✓" : ""}
                        </span>

                        <span
                          className={`text-sm ${
                            completed
                              ? "text-[#86868B] line-through"
                              : ""
                          }`}
                        >
                          {task}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {todayPlan.optionalTasks?.length ? (
                  <div className="mt-7">
                    <p className="mb-3 text-xs text-[#86868B]">
                      مهمة إضافية
                    </p>

                    {todayPlan.optionalTasks.map((task) => (
                      <div
                        key={task}
                        className="rounded-[18px] bg-[#F5F5F7] p-4 text-sm"
                      >
                        {task}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-8">
                  <div className="mb-3 flex justify-between text-xs">
                    <span className="text-[#86868B]">
                      تقدم اليوم
                    </span>

                    <span>{progress}%</span>
                  </div>

                  <div className="h-[6px] overflow-hidden rounded-full bg-[#E8E8ED]">
                    <div
                      className="h-full rounded-full bg-[#0071E3] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startTodaySession}
                  className="mt-8 rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#0077ED]"
                >
                  ابدأ المذاكرة
                </button>
              </div>
            </section>

            <div className="space-y-5">
              <InfoCard
                label="وقت التركيز اليوم"
                value={formatFocusTime(focusSeconds)}
                note="محسوب من المؤقت الفعلي فقط."
              />

              <InfoCard
                label="الدرجات"
                value={
                  grades.length
                    ? `${grades.length} تقييم`
                    : "لا توجد درجات"
                }
                note={
                  grades.length
                    ? "افتح صفحة الدرجات للتفاصيل."
                    : "أضف أول تقييم لما تستلمه."
                }
              />

              <InfoCard
                label="نقاط الضعف"
                value="لا توجد بيانات"
                note="هنضيف تسجيل نقاط الضعف في المرحلة القادمة."
              />
            </div>
          </div>
        )}

        {(todayPlan.rest || todayPlan.catchUp) && (
          <div className="mt-5">
            <InfoCard
              label="وقت التركيز اليوم"
              value={formatFocusTime(focusSeconds)}
              note="محسوب من جلسات المؤقت فقط."
            />
          </div>
        )}
      </>
    );
  }

  function renderPlan() {
    const orderedDays = [6, 0, 1, 2, 3, 4, 5];

    return (
      <>
        <PageHeader
          eyebrow="الأسبوع"
          title="خطتي"
          subtitle="الجدول الثابت اللي اتفقنا عليه، من السبت للجمعة."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {orderedDays.map((dayIndex) => {
            const plan = weeklyPlan[dayIndex];

            return (
              <section
                key={plan.day}
                className="rounded-[28px] bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {plan.day}
                    </p>

                    {plan.subject && (
                      <>
                        <h2 className="mt-4 text-xl font-semibold">
                          {plan.subject}
                        </h2>

                        <p className="mt-1 text-sm text-[#86868B]">
                          {plan.teacher}
                        </p>
                      </>
                    )}

                    {plan.catchUp && (
                      <h2 className="mt-4 text-xl font-semibold">
                        مراجعة وتراكمات
                      </h2>
                    )}

                    {plan.rest && (
                      <h2 className="mt-4 text-xl font-semibold">
                        راحة
                      </h2>
                    )}
                  </div>
                </div>

                {plan.tasks.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {plan.tasks.map((task) => (
                      <div
                        key={task}
                        className="flex gap-3 text-sm text-[#6E6E73]"
                      >
                        <span>—</span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                )}

                {plan.optionalTasks?.length ? (
                  <div className="mt-5 rounded-[18px] bg-[#F5F5F7] p-4">
                    <p className="text-xs text-[#86868B]">
                      إضافي
                    </p>

                    <p className="mt-2 text-sm">
                      {plan.optionalTasks[0]}
                    </p>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </>
    );
  }

  function renderSubjects() {
    return (
      <>
        <PageHeader
          eyebrow="المناهج"
          title="المواد"
          subtitle="المواد الأساسية في مسار المذاكرة الحالي."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => (
            <section
              key={subject.name}
              className="group rounded-[28px] bg-white p-6 transition hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#F5F5F7] text-sm font-semibold">
                {subject.name.charAt(0)}
              </div>

              <h2 className="mt-7 text-xl font-semibold">
                {subject.name}
              </h2>

              <p className="mt-2 text-sm text-[#86868B]">
                {subject.teacher}
              </p>

              <p className="mt-6 text-sm leading-7 text-[#6E6E73]">
                {subject.description}
              </p>

              <div className="mt-8 border-t border-[#ECECEF] pt-5">
                <p className="text-xs text-[#86868B]">
                  تقدم المنهج
                </p>

                <p className="mt-2 text-sm font-medium">
                  لا توجد بيانات تقدم مسجلة بعد
                </p>
              </div>
            </section>
          ))}
        </div>
      </>
    );
  }

  function renderTimer() {
    return (
      <>
        <PageHeader
          eyebrow="Focus"
          title="المؤقت"
          subtitle="جلسة هادية، بهدف واضح، من غير أي تشتيت."
        />

        <section className="mx-auto max-w-3xl rounded-[36px] bg-white p-6 sm:p-10">
          <div className="flex flex-wrap gap-2">
            {[25, 50, 55].map((minutes) => (
              <button
                key={minutes}
                type="button"
                disabled={timerRunning}
                onClick={() =>
                  changeTimerDuration(minutes)
                }
                className={`rounded-full px-4 py-2 text-sm transition ${
                  timerMinutes === minutes
                    ? "bg-black text-white"
                    : "bg-[#F5F5F7] text-[#6E6E73]"
                }`}
              >
                {minutes} دقيقة
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[#86868B]">
                المادة
              </label>

              <select
                value={selectedSubject}
                disabled={timerRunning}
                onChange={(event) =>
                  setSelectedSubject(event.target.value)
                }
                className="mt-2 w-full rounded-[16px] border border-[#E5E5EA] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#0071E3]"
              >
                {subjects.map((subject) => (
                  <option
                    key={subject.name}
                    value={subject.name}
                  >
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[#86868B]">
                هدف الجلسة
              </label>

              <input
                value={sessionGoal}
                disabled={timerRunning}
                onChange={(event) =>
                  setSessionGoal(event.target.value)
                }
                placeholder="مثال: حل 30 سؤال"
                className="mt-2 w-full rounded-[16px] border border-[#E5E5EA] px-4 py-3.5 text-sm outline-none placeholder:text-[#AEAEB2] focus:border-[#0071E3]"
              />
            </div>
          </div>

          <div className="py-14 text-center">
            <p className="text-sm text-[#86868B]">
              {selectedSubject}
            </p>

            {sessionGoal && (
              <p className="mt-2 text-sm font-medium">
                {sessionGoal}
              </p>
            )}

            <div
              dir="ltr"
              className="mt-8 text-[76px] font-semibold tracking-[-0.06em] text-black sm:text-[110px]"
            >
              {formatTimer(secondsLeft)}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                setTimerRunning((current) => !current)
              }
              className="rounded-full bg-[#0071E3] px-8 py-4 text-sm font-medium text-white"
            >
              {timerRunning
                ? "إيقاف مؤقت"
                : secondsLeft === timerMinutes * 60
                  ? "ابدأ"
                  : "استكمال"}
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="rounded-full bg-[#F5F5F7] px-8 py-4 text-sm font-medium"
            >
              إعادة
            </button>
          </div>

          <div className="mt-10 border-t border-[#ECECEF] pt-6 text-center">
            <p className="text-xs text-[#86868B]">
              وقت التركيز المسجل اليوم
            </p>

            <p className="mt-2 text-lg font-semibold">
              {formatFocusTime(focusSeconds)}
            </p>
          </div>
        </section>
      </>
    );
  }

  function renderGrades() {
    return (
      <>
        <PageHeader
          eyebrow="Assessments"
          title="الدرجات"
          subtitle="سجّل درجاتك الفعلية، ومسار هيعتمد عليها بعدين في التحليل."
        />

        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={addGrade}
            className="rounded-[28px] bg-white p-6"
          >
            <h2 className="text-lg font-semibold">
              إضافة تقييم
            </h2>

            <div className="mt-6 space-y-5">
              <Field label="المادة">
                <select
                  value={gradeSubject}
                  onChange={(event) =>
                    setGradeSubject(event.target.value)
                  }
                  className="input-style"
                >
                  {subjects.map((subject) => (
                    <option
                      key={subject.name}
                      value={subject.name}
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="نوع التقييم">
                <select
                  value={gradeType}
                  onChange={(event) =>
                    setGradeType(event.target.value)
                  }
                  className="input-style"
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Homework">
                    Homework
                  </option>
                  <option value="Exam">Exam</option>
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="درجتك">
                  <input
                    type="number"
                    min="0"
                    value={gradeScore}
                    onChange={(event) =>
                      setGradeScore(event.target.value)
                    }
                    className="input-style"
                  />
                </Field>

                <Field label="من">
                  <input
                    type="number"
                    min="1"
                    value={gradeTotal}
                    onChange={(event) =>
                      setGradeTotal(event.target.value)
                    }
                    className="input-style"
                  />
                </Field>
              </div>
            </div>

            <button className="mt-7 w-full rounded-full bg-[#0071E3] px-5 py-3.5 text-sm font-medium text-white">
              حفظ الدرجة
            </button>
          </form>

          <section className="rounded-[28px] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                التقييمات
              </h2>

              {gradeAverage !== null && (
                <span className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm">
                  المتوسط {gradeAverage}%
                </span>
              )}
            </div>

            {grades.length === 0 ? (
              <EmptyState text="مفيش أي درجات مسجلة لسه." />
            ) : (
              <div className="mt-6 space-y-3">
                {grades.map((grade) => {
                  const percentage = Math.round(
                    (grade.score / grade.total) * 100
                  );

                  return (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between gap-4 rounded-[20px] bg-[#F5F5F7] p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {grade.subject}
                        </p>

                        <p className="mt-1 text-xs text-[#86868B]">
                          {grade.type}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="text-sm font-semibold">
                            {grade.score}/{grade.total}
                          </p>

                          <p className="text-xs text-[#86868B]">
                            {percentage}%
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteGrade(grade.id)
                          }
                          className="text-xs text-[#86868B] hover:text-red-500"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </>
    );
  }

  function renderAnalytics() {
    return (
      <>
        <PageHeader
          eyebrow="Analytics"
          title="التحليلات"
          subtitle="هنا مفيش أرقام وهمية. كل رقم ظاهر ناتج عن استخدامك الحقيقي."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <InfoCard
            label="وقت التركيز اليوم"
            value={formatFocusTime(focusSeconds)}
            note="من جلسات المؤقت."
          />

          <InfoCard
            label="إنجاز مهام اليوم"
            value={
              todayPlan.tasks.length
                ? `${progress}%`
                : "لا توجد مهام"
            }
            note={
              todayPlan.tasks.length
                ? `${completedTasks.length} من ${todayPlan.tasks.length}`
                : "اليوم بدون خطة ثابتة."
            }
          />

          <InfoCard
            label="متوسط الدرجات"
            value={
              gradeAverage === null
                ? "لا توجد بيانات"
                : `${gradeAverage}%`
            }
            note={
              gradeAverage === null
                ? "أضف تقييمات أولًا."
                : `مبني على ${grades.length} تقييم`
            }
          />
        </div>

        <section className="mt-5 rounded-[32px] bg-white p-7">
          <h2 className="text-xl font-semibold">
            التحليل الأسبوعي
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6E6E73]">
            التقرير الذكي مش هيتولد دلوقتي لأننا لسه
            بنجمع بياناتك. لما يبقى عندنا وقت مذاكرة،
            درجات، مستوى تركيز ونقاط ضعف كفاية، هنضيف
            التحليل الأسبوعي هنا.
          </p>
        </section>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <PageHeader
          eyebrow="Masar"
          title="الإعدادات"
          subtitle="خلي مسار مناسب لطريقتك في المذاكرة."
        />

        <section className="max-w-2xl rounded-[28px] bg-white p-6 sm:p-8">
          <Field label="اسمك">
            <input
              value={studentName}
              onChange={(event) =>
                setStudentName(event.target.value)
              }
              className="input-style"
            />
          </Field>

          <div className="mt-6">
            <p className="text-xs text-[#86868B]">
              مدة التركيز الافتراضية
            </p>

            <div className="mt-3 flex gap-2">
              {[25, 50, 55].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() =>
                    changeTimerDuration(minutes)
                  }
                  className={`rounded-full px-4 py-2.5 text-sm ${
                    timerMinutes === minutes
                      ? "bg-black text-white"
                      : "bg-[#F5F5F7]"
                  }`}
                >
                  {minutes} دقيقة
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[20px] bg-[#F5F5F7] p-5">
            <p className="text-sm font-medium">
              يوم الراحة
            </p>

            <p className="mt-1 text-sm text-[#86868B]">
              الجمعة
            </p>
          </div>

          <button
            type="button"
            onClick={saveStudentName}
            className="mt-7 rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white"
          >
            حفظ الإعدادات
          </button>
        </section>
      </>
    );
  }

  function renderContent() {
    switch (activeView) {
      case "plan":
        return renderPlan();

      case "subjects":
        return renderSubjects();

      case "timer":
        return renderTimer();

      case "grades":
        return renderGrades();

      case "analytics":
        return renderAnalytics();

      case "settings":
        return renderSettings();

      default:
        return renderToday();
    }
  }

  return (
    <>
      <style jsx global>{`
        .input-style {
          margin-top: 0.5rem;
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e5e5ea;
          background: #ffffff;
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          outline: none;
        }

        .input-style:focus {
          border-color: #0071e3;
        }
      `}</style>

      <div
        dir="rtl"
        className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]"
      >
        <div className="mx-auto flex min-h-screen max-w-[1600px]">
          {/* Desktop Sidebar */}
          <aside className="sticky top-0 hidden h-screen w-[230px] shrink-0 px-5 py-6 lg:block">
            <div className="flex h-full flex-col rounded-[30px] bg-white p-4">
              <button
                type="button"
                onClick={() => setActiveView("today")}
                className="px-3 py-4 text-right"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-black text-sm font-semibold text-white">
                    م
                  </div>

                  <div>
                    <h1 className="text-lg font-semibold">
                      مسار
                    </h1>

                    <p className="mt-0.5 text-[11px] text-[#86868B]">
                      Study Companion
                    </p>
                  </div>
                </div>
              </button>

              <nav className="mt-6 space-y-1">
                {navigation.map((item) => {
                  const active =
                    activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveView(item.id)
                      }
                      className={`flex w-full items-center gap-3 rounded-[15px] px-3 py-3 text-sm transition ${
                        active
                          ? "bg-[#F5F5F7] font-medium text-black"
                          : "text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-black"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] text-xs">
                        {item.symbol}
                      </span>

                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-[#ECECEF] pt-4">
                <div className="rounded-2xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs text-white">
                      {studentName.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {studentName}
                      </p>

                      <p className="mt-0.5 text-xs text-[#86868B]">
                        تانية بكالوريا
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setActiveView("today")}
                className="text-right"
              >
                <p className="text-xl font-semibold">
                  مسار
                </p>

                <p className="mt-1 text-xs text-[#86868B]">
                  مذاكرتك، في مسار واضح
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveView("timer")
                }
                className="rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white"
              >
                جلسة مذاكرة
              </button>
            </div>

            {renderContent()}
          </main>
        </div>

        {/* Mobile Navigation */}
        <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-[24px] border border-black/5 bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-5">
            {navigation.slice(0, 5).map((item) => {
              const active =
                activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveView(item.id)
                  }
                  className={`rounded-[16px] px-2 py-2 text-center ${
                    active
                      ? "bg-[#F5F5F7] text-black"
                      : "text-[#86868B]"
                  }`}
                >
                  <span className="block text-sm">
                    {item.symbol}
                  </span>

                  <span className="mt-1 block text-[10px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-9">
      <p className="mb-2 text-sm text-[#86868B]">
        {eyebrow}
      </p>

      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[46px]">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6E6E73]">
        {subtitle}
      </p>
    </header>
  );
}

function InfoCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <section className="rounded-[28px] bg-white p-6">
      <p className="text-xs text-[#86868B]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-[#86868B]">
        {note}
      </p>
    </section>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-6 rounded-[22px] bg-[#F5F5F7] px-5 py-10 text-center">
      <p className="text-sm text-[#86868B]">
        {text}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-[#86868B]">
        {label}
      </span>

      {children}
    </label>
  );
}