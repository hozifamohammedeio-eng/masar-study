"use client";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AnalyticsView from "@/components/AnalyticsView";
import SubjectsView from "@/components/SubjectsView";

import { curriculum } from "@/data/curriculumData";

import {
  addStudySession,
  getLocalDateKey,
  loadStudySessions,
  type StudySession,
} from "@/data/sessionData";

import {
  subjects,
  weeklyPlan,
} from "@/data/studyData";

type View =
  | "today"
  | "plan"
  | "subjects"
  | "timer"
  | "grades"
  | "analytics"
  | "settings";

type Grade = {
  id: string;
  subject: string;
  type: "Quiz" | "Homework" | "Exam";
  score: number;
  total: number;
  date: string;
};

const navigation: {
  id: View;
  label: string;
  symbol: string;
}[] = [
  {
    id: "today",
    label: "اليوم",
    symbol: "●",
  },
  {
    id: "plan",
    label: "خطتي",
    symbol: "□",
  },
  {
    id: "subjects",
    label: "المواد",
    symbol: "◫",
  },
  {
    id: "timer",
    label: "المؤقت",
    symbol: "◷",
  },
  {
    id: "grades",
    label: "الدرجات",
    symbol: "✓",
  },
  {
    id: "analytics",
    label: "التحليلات",
    symbol: "⌁",
  },
  {
    id: "settings",
    label: "الإعدادات",
    symbol: "⚙",
  },
];

const inputClass =
  "mt-2 w-full rounded-[16px] border border-[#E5E5EA] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AEAEB2] focus:border-[#0071E3]";

export default function Home() {
  const [now, setNow] =
    useState<Date | null>(null);

  const [activeView, setActiveView] =
    useState<View>("today");

  const [
    completedTasks,
    setCompletedTasks,
  ] = useState<number[]>([]);

  const [
    tasksLoaded,
    setTasksLoaded,
  ] = useState(false);

  const [
    studySessions,
    setStudySessions,
  ] = useState<StudySession[]>([]);

  const [
    timerRunning,
    setTimerRunning,
  ] = useState(false);

  const [
    timerMinutes,
    setTimerMinutes,
  ] = useState(50);

  const [
    secondsLeft,
    setSecondsLeft,
  ] = useState(50 * 60);

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("اللغة العربية");

  const [
    sessionGoal,
    setSessionGoal,
  ] = useState("");

  const timerStartedAtRef =
    useRef<Date | null>(null);

  const timerStartRemainingRef =
    useRef<number | null>(null);

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [
    gradesLoaded,
    setGradesLoaded,
  ] = useState(false);

  const [
    gradeSubject,
    setGradeSubject,
  ] = useState("اللغة العربية");

  const [
    gradeType,
    setGradeType,
  ] =
    useState<Grade["type"]>(
      "Quiz"
    );

  const [
    gradeScore,
    setGradeScore,
  ] = useState("");

  const [
    gradeTotal,
    setGradeTotal,
  ] = useState("");

  const [
    studentName,
    setStudentName,
  ] = useState("حذيفة");

  // ==========================================
  // Current date
  // ==========================================

  useEffect(() => {
    setNow(new Date());
  }, []);

  const todayPlan = now
    ? weeklyPlan[now.getDay()]
    : weeklyPlan[0];

  const todayKey = useMemo(
    () =>
      now
        ? getLocalDateKey(now)
        : "",
    [now]
  );

  const formattedDate =
    useMemo(() => {
      if (!now) return "";

      return new Intl.DateTimeFormat(
        "ar-EG",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      ).format(now);
    }, [now]);

  const greeting =
    useMemo(() => {
      if (!now) return "";

      return now.getHours() < 12
        ? "صباح الخير"
        : "مساء الخير";
    }, [now]);

  // ==========================================
  // Student settings
  // ==========================================

  useEffect(() => {
    const savedName =
      localStorage.getItem(
        "masar-student-name"
      );

    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  // ==========================================
  // Today's tasks
  // ==========================================

  useEffect(() => {
    if (!todayKey) return;

    setTasksLoaded(false);
    setCompletedTasks([]);

    const saved =
      localStorage.getItem(
        `masar-completed-tasks-${todayKey}`
      );

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setCompletedTasks(
            parsed
          );
        }
      } catch {
        setCompletedTasks([]);
      }
    }

    setTasksLoaded(true);
  }, [todayKey]);

  useEffect(() => {
    if (
      !todayKey ||
      !tasksLoaded
    ) {
      return;
    }

    localStorage.setItem(
      `masar-completed-tasks-${todayKey}`,
      JSON.stringify(
        completedTasks
      )
    );
  }, [
    completedTasks,
    tasksLoaded,
    todayKey,
  ]);

  // ==========================================
  // Study sessions
  // ==========================================

  const refreshStudySessions =
    useCallback(() => {
      setStudySessions(
        loadStudySessions()
      );
    }, []);

  useEffect(() => {
    refreshStudySessions();
  }, [
    activeView,
    refreshStudySessions,
  ]);

  const todayFocusSeconds =
    useMemo(() => {
      if (!todayKey) return 0;

      return studySessions
        .filter(
          (session) =>
            session.dateKey ===
            todayKey
        )
        .reduce(
          (total, session) =>
            total +
            session.durationSeconds,
          0
        );
    }, [
      studySessions,
      todayKey,
    ]);

  // ==========================================
  // Grades
  // ==========================================

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "masar-grades"
      );

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setGrades(parsed);
        }
      } catch {
        setGrades([]);
      }
    }

    setGradesLoaded(true);
  }, []);

  useEffect(() => {
    if (!gradesLoaded) {
      return;
    }

    localStorage.setItem(
      "masar-grades",
      JSON.stringify(grades)
    );
  }, [
    grades,
    gradesLoaded,
  ]);

  // ==========================================
  // Main timer save logic
  // ==========================================

  const saveMainTimerSegment =
    useCallback(
      (
        remainingSeconds: number
      ) => {
        const startedAt =
          timerStartedAtRef.current;

        const startingRemaining =
          timerStartRemainingRef.current;

        if (
          !startedAt ||
          startingRemaining ===
            null
        ) {
          return;
        }

        const durationSeconds =
          Math.max(
            0,
            startingRemaining -
              remainingSeconds
          );

        const subject =
          curriculum.find(
            (item) =>
              item.name ===
              selectedSubject
          );

        if (
          durationSeconds > 0 &&
          subject
        ) {
          addStudySession({
            context: {
              subjectId:
                subject.id,
              subjectName:
                subject.name,
              goal:
                sessionGoal.trim() ||
                undefined,
            },
            startedAt,
            endedAt:
              new Date(),
            durationSeconds,
          });
        }

        timerStartedAtRef.current =
          null;

        timerStartRemainingRef.current =
          null;

        refreshStudySessions();
      },
      [
        selectedSubject,
        sessionGoal,
        refreshStudySessions,
      ]
    );

  // ==========================================
  // Main timer countdown
  // ==========================================

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const interval =
      window.setInterval(() => {
        setSecondsLeft(
          (current) =>
            Math.max(
              current - 1,
              0
            )
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [timerRunning]);

  useEffect(() => {
    if (
      timerRunning &&
      secondsLeft === 0
    ) {
      saveMainTimerSegment(0);
      setTimerRunning(false);
    }
  }, [
    timerRunning,
    secondsLeft,
    saveMainTimerSegment,
  ]);

  // ==========================================
  // Calculations
  // ==========================================

  const progress =
    useMemo(() => {
      if (
        !todayPlan.tasks.length
      ) {
        return 0;
      }

      return Math.round(
        (completedTasks.length /
          todayPlan.tasks
            .length) *
          100
      );
    }, [
      completedTasks,
      todayPlan.tasks.length,
    ]);

  const gradeAverage =
    useMemo(() => {
      if (
        grades.length === 0
      ) {
        return null;
      }

      const values =
        grades.map(
          (grade) =>
            (grade.score /
              grade.total) *
            100
        );

      return Math.round(
        values.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / values.length
      );
    }, [grades]);

  // ==========================================
  // Tasks
  // ==========================================

  function toggleTask(
    index: number
  ) {
    setCompletedTasks(
      (current) =>
        current.includes(index)
          ? current.filter(
              (item) =>
                item !== index
            )
          : [
              ...current,
              index,
            ]
    );
  }

  // ==========================================
  // Timer controls
  // ==========================================

  function changeTimerDuration(
    minutes: number
  ) {
    if (timerRunning) {
      return;
    }

    setTimerMinutes(minutes);

    setSecondsLeft(
      minutes * 60
    );
  }

  function startTimer() {
    if (
      timerRunning ||
      secondsLeft <= 0
    ) {
      return;
    }

    timerStartedAtRef.current =
      new Date();

    timerStartRemainingRef.current =
      secondsLeft;

    setTimerRunning(true);
  }

  function pauseTimer() {
    if (!timerRunning) {
      return;
    }

    saveMainTimerSegment(
      secondsLeft
    );

    setTimerRunning(false);
  }

  function resetTimer() {
    if (timerRunning) {
      saveMainTimerSegment(
        secondsLeft
      );
    }

    setTimerRunning(false);

    setSecondsLeft(
      timerMinutes * 60
    );
  }

  function startTodaySession() {
    if (todayPlan.subject) {
      setSelectedSubject(
        todayPlan.subject
      );
    }

    const firstIncompleteTask =
      todayPlan.tasks.find(
        (_, index) =>
          !completedTasks.includes(
            index
          )
      );

    setSessionGoal(
      firstIncompleteTask ??
        ""
    );

    setActiveView(
      "timer"
    );
  }

  // ==========================================
  // Formatting
  // ==========================================

  function formatTimer(
    totalSeconds: number
  ) {
    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  function formatFocusTime(
    totalSeconds: number
  ) {
    if (
      totalSeconds < 60 &&
      totalSeconds > 0
    ) {
      return "أقل من دقيقة";
    }

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    if (minutes === 0) {
      return "0 دقيقة";
    }

    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    const remainingMinutes =
      minutes % 60;

    if (
      remainingMinutes === 0
    ) {
      return `${hours} ساعة`;
    }

    return `${hours} س ${remainingMinutes} د`;
  }

  // ==========================================
  // Grades
  // ==========================================

  function addGrade(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const score =
      Number(gradeScore);

    const total =
      Number(gradeTotal);

    if (
      gradeScore.trim() ===
        "" ||
      gradeTotal.trim() ===
        "" ||
      Number.isNaN(score) ||
      Number.isNaN(total) ||
      score < 0 ||
      total <= 0 ||
      score > total
    ) {
      return;
    }

    const grade: Grade = {
      id: crypto.randomUUID(),
      subject:
        gradeSubject,
      type: gradeType,
      score,
      total,
      date:
        new Date().toISOString(),
    };

    setGrades(
      (current) => [
        grade,
        ...current,
      ]
    );

    setGradeScore("");
    setGradeTotal("");
  }

  function deleteGrade(
    id: string
  ) {
    setGrades(
      (current) =>
        current.filter(
          (grade) =>
            grade.id !== id
        )
    );
  }

  function saveStudentName() {
    const trimmedName =
      studentName.trim();

    if (!trimmedName) {
      return;
    }

    setStudentName(
      trimmedName
    );

    localStorage.setItem(
      "masar-student-name",
      trimmedName
    );
  }

  // ==========================================
  // Today view
  // ==========================================

  function renderToday() {
    return (
      <>
        <PageHeader
          eyebrow={
            formattedDate
          }
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
              مفيش مهام مذاكرة
              أساسية النهارده.
            </p>

            <div className="mt-8 rounded-[22px] bg-white/10 p-5">
              <p className="text-sm font-medium">
                التقرير الأسبوعي
              </p>

              <p className="mt-2 text-sm text-[#A1A1A6]">
                التقرير هيعتمد
                على جلساتك ودرجاتك
                الفعلية.
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
              يوم المراجعة
              والتراكمات
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#6E6E73]">
              مفيش مادة ثابتة
              النهارده. التراكمات
              اللي هنسجلها بعدين
              هتظهر هنا.
            </p>
          </section>
        )}

        {!todayPlan.rest &&
          !todayPlan.catchUp && (
            <div className="grid gap-5 xl:grid-cols-[1.55fr_0.75fr]">
              <section className="overflow-hidden rounded-[32px] bg-white">
                <div className="border-b border-[#ECECEF] p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0071E3]" />

                    <span className="text-xs font-medium text-[#0071E3]">
                      خطة اليوم
                    </span>
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight text-black">
                    {
                      todayPlan.subject
                    }
                  </h2>

                  <p className="mt-2 text-sm text-[#86868B]">
                    {
                      todayPlan.teacher
                    }
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        مهام اليوم
                      </p>

                      <p className="mt-1 text-xs text-[#86868B]">
                        تقدمك بيتحفظ
                        تلقائيًا
                      </p>
                    </div>

                    <span className="text-sm text-[#6E6E73]">
                      {
                        completedTasks.length
                      }
                      /
                      {
                        todayPlan
                          .tasks
                          .length
                      }
                    </span>
                  </div>

                  <div className="space-y-2">
                    {todayPlan.tasks.map(
                      (
                        task,
                        index
                      ) => {
                        const completed =
                          completedTasks.includes(
                            index
                          );

                        return (
                          <button
                            key={
                              task
                            }
                            type="button"
                            onClick={() =>
                              toggleTask(
                                index
                              )
                            }
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
                              {completed
                                ? "✓"
                                : ""}
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
                      }
                    )}
                  </div>

                  {todayPlan.optionalTasks
                    ?.length ? (
                    <div className="mt-7">
                      <p className="mb-3 text-xs text-[#86868B]">
                        مهمة إضافية
                      </p>

                      {todayPlan.optionalTasks.map(
                        (task) => (
                          <div
                            key={
                              task
                            }
                            className="rounded-[18px] bg-[#F5F5F7] p-4 text-sm"
                          >
                            {task}
                          </div>
                        )
                      )}
                    </div>
                  ) : null}

                  <div className="mt-8">
                    <div className="mb-3 flex justify-between text-xs">
                      <span className="text-[#86868B]">
                        تقدم اليوم
                      </span>

                      <span>
                        {progress}%
                      </span>
                    </div>

                    <div className="h-[6px] overflow-hidden rounded-full bg-[#E8E8ED]">
                      <div
                        className="h-full rounded-full bg-[#0071E3] transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      startTodaySession
                    }
                    className="mt-8 rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#0077ED]"
                  >
                    ابدأ المذاكرة
                  </button>
                </div>
              </section>

              <div className="space-y-5">
                <InfoCard
                  label="وقت التركيز اليوم"
                  value={formatFocusTime(
                    todayFocusSeconds
                  )}
                  note="من جلسات المذاكرة المسجلة."
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
                  note="هنضيف تسجيل نقاط الضعف بعدين."
                />
              </div>
            </div>
          )}

        {(todayPlan.rest ||
          todayPlan.catchUp) && (
          <div className="mt-5">
            <InfoCard
              label="وقت التركيز اليوم"
              value={formatFocusTime(
                todayFocusSeconds
              )}
              note="من جلسات المذاكرة المسجلة."
            />
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // Weekly plan
  // ==========================================

  function renderPlan() {
    const orderedDays = [
      6,
      0,
      1,
      2,
      3,
      4,
      5,
    ];

    return (
      <>
        <PageHeader
          eyebrow="الأسبوع"
          title="خطتي"
          subtitle="الجدول الثابت من السبت للجمعة."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {orderedDays.map(
            (dayIndex) => {
              const plan =
                weeklyPlan[
                  dayIndex
                ];

              return (
                <section
                  key={
                    plan.day
                  }
                  className="rounded-[28px] bg-white p-6"
                >
                  <p className="text-sm font-semibold">
                    {plan.day}
                  </p>

                  {plan.subject && (
                    <>
                      <h2 className="mt-4 text-xl font-semibold">
                        {
                          plan.subject
                        }
                      </h2>

                      <p className="mt-1 text-sm text-[#86868B]">
                        {
                          plan.teacher
                        }
                      </p>
                    </>
                  )}

                  {plan.catchUp && (
                    <h2 className="mt-4 text-xl font-semibold">
                      مراجعة
                      وتراكمات
                    </h2>
                  )}

                  {plan.rest && (
                    <h2 className="mt-4 text-xl font-semibold">
                      راحة
                    </h2>
                  )}

                  {plan.tasks
                    .length >
                    0 && (
                    <div className="mt-6 space-y-3">
                      {plan.tasks.map(
                        (task) => (
                          <div
                            key={
                              task
                            }
                            className="flex gap-3 text-sm text-[#6E6E73]"
                          >
                            <span>
                              —
                            </span>

                            <span>
                              {task}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {plan.optionalTasks
                    ?.length ? (
                    <div className="mt-5 rounded-[18px] bg-[#F5F5F7] p-4">
                      <p className="text-xs text-[#86868B]">
                        إضافي
                      </p>

                      <p className="mt-2 text-sm">
                        {
                          plan
                            .optionalTasks[0]
                        }
                      </p>
                    </div>
                  ) : null}
                </section>
              );
            }
          )}
        </div>
      </>
    );
  }

  // ==========================================
  // Main timer
  // ==========================================

  function renderTimer() {
    return (
      <>
        <PageHeader
          eyebrow="Focus"
          title="المؤقت"
          subtitle="كل جلسة بتتسجل للمادة اللي اخترتها."
        />

        <section className="mx-auto max-w-3xl rounded-[36px] bg-white p-6 sm:p-10">
          <div className="flex flex-wrap gap-2">
            {[25, 50, 55].map(
              (minutes) => (
                <button
                  key={minutes}
                  type="button"
                  disabled={
                    timerRunning
                  }
                  onClick={() =>
                    changeTimerDuration(
                      minutes
                    )
                  }
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    timerMinutes ===
                    minutes
                      ? "bg-black text-white"
                      : "bg-[#F5F5F7] text-[#6E6E73]"
                  } disabled:opacity-50`}
                >
                  {minutes} دقيقة
                </button>
              )
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field label="المادة">
              <select
                value={
                  selectedSubject
                }
                disabled={
                  timerRunning
                }
                onChange={(
                  event
                ) =>
                  setSelectedSubject(
                    event.target
                      .value
                  )
                }
                className={
                  inputClass
                }
              >
                {subjects.map(
                  (subject) => (
                    <option
                      key={
                        subject.name
                      }
                      value={
                        subject.name
                      }
                    >
                      {
                        subject.name
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="هدف الجلسة">
              <input
                value={
                  sessionGoal
                }
                disabled={
                  timerRunning
                }
                onChange={(
                  event
                ) =>
                  setSessionGoal(
                    event.target
                      .value
                  )
                }
                placeholder="مثال: حل 30 سؤال"
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          <div className="py-14 text-center">
            <p className="text-sm text-[#86868B]">
              {
                selectedSubject
              }
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
              {formatTimer(
                secondsLeft
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {!timerRunning ? (
              <button
                type="button"
                disabled={
                  secondsLeft ===
                  0
                }
                onClick={
                  startTimer
                }
                className="rounded-full bg-[#0071E3] px-8 py-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {secondsLeft ===
                timerMinutes *
                  60
                  ? "ابدأ"
                  : "استكمال"}
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  pauseTimer
                }
                className="rounded-full bg-black px-8 py-4 text-sm font-medium text-white"
              >
                إيقاف مؤقت
              </button>
            )}

            <button
              type="button"
              onClick={
                resetTimer
              }
              className="rounded-full bg-[#F5F5F7] px-8 py-4 text-sm font-medium"
            >
              إعادة
            </button>
          </div>

          {secondsLeft ===
            0 && (
            <p className="mt-6 text-center text-sm font-medium text-[#34C759]">
              انتهت الجلسة ✓
            </p>
          )}

          <div className="mt-10 border-t border-[#ECECEF] pt-6 text-center">
            <p className="text-xs text-[#86868B]">
              وقت التركيز المسجل
              اليوم
            </p>

            <p className="mt-2 text-lg font-semibold">
              {formatFocusTime(
                todayFocusSeconds
              )}
            </p>
          </div>
        </section>
      </>
    );
  }

  // ==========================================
  // Grades
  // ==========================================

  function renderGrades() {
    return (
      <>
        <PageHeader
          eyebrow="Assessments"
          title="الدرجات"
          subtitle="سجّل درجاتك الفعلية عشان نستخدمها في التحليل."
        />

        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <form
            onSubmit={
              addGrade
            }
            className="rounded-[28px] bg-white p-6"
          >
            <h2 className="text-lg font-semibold">
              إضافة تقييم
            </h2>

            <div className="mt-6 space-y-5">
              <Field label="المادة">
                <select
                  value={
                    gradeSubject
                  }
                  onChange={(
                    event
                  ) =>
                    setGradeSubject(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  {subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject.name
                        }
                        value={
                          subject.name
                        }
                      >
                        {
                          subject.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="نوع التقييم">
                <select
                  value={
                    gradeType
                  }
                  onChange={(
                    event
                  ) =>
                    setGradeType(
                      event.target
                        .value as Grade["type"]
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="Quiz">
                    Quiz
                  </option>

                  <option value="Homework">
                    Homework
                  </option>

                  <option value="Exam">
                    Exam
                  </option>
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="درجتك">
                  <input
                    type="number"
                    min="0"
                    value={
                      gradeScore
                    }
                    onChange={(
                      event
                    ) =>
                      setGradeScore(
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>

                <Field label="من">
                  <input
                    type="number"
                    min="1"
                    value={
                      gradeTotal
                    }
                    onChange={(
                      event
                    ) =>
                      setGradeTotal(
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-[#0071E3] px-5 py-3.5 text-sm font-medium text-white"
            >
              حفظ الدرجة
            </button>
          </form>

          <section className="rounded-[28px] bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">
                التقييمات
              </h2>

              {gradeAverage !==
                null && (
                <span className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm">
                  المتوسط{" "}
                  {
                    gradeAverage
                  }
                  %
                </span>
              )}
            </div>

            {grades.length ===
            0 ? (
              <EmptyState text="مفيش أي درجات مسجلة لسه." />
            ) : (
              <div className="mt-6 space-y-3">
                {grades.map(
                  (grade) => {
                    const percentage =
                      Math.round(
                        (grade.score /
                          grade.total) *
                          100
                      );

                    return (
                      <div
                        key={
                          grade.id
                        }
                        className="flex items-center justify-between gap-4 rounded-[20px] bg-[#F5F5F7] p-4"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {
                              grade.subject
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#86868B]">
                            {
                              grade.type
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="text-sm font-semibold">
                              {
                                grade.score
                              }
                              /
                              {
                                grade.total
                              }
                            </p>

                            <p className="text-xs text-[#86868B]">
                              {
                                percentage
                              }
                              %
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              deleteGrade(
                                grade.id
                              )
                            }
                            className="text-xs text-[#86868B] transition hover:text-red-500"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      </>
    );
  }

  // ==========================================
  // Settings
  // ==========================================

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
              value={
                studentName
              }
              onChange={(
                event
              ) =>
                setStudentName(
                  event.target
                    .value
                )
              }
              className={
                inputClass
              }
            />
          </Field>

          <div className="mt-6">
            <p className="text-xs text-[#86868B]">
              مدة التركيز
              الافتراضية
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {[25, 50, 55].map(
                (minutes) => (
                  <button
                    key={
                      minutes
                    }
                    type="button"
                    disabled={
                      timerRunning
                    }
                    onClick={() =>
                      changeTimerDuration(
                        minutes
                      )
                    }
                    className={`rounded-full px-4 py-2.5 text-sm ${
                      timerMinutes ===
                      minutes
                        ? "bg-black text-white"
                        : "bg-[#F5F5F7]"
                    } disabled:opacity-50`}
                  >
                    {minutes} دقيقة
                  </button>
                )
              )}
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
            onClick={
              saveStudentName
            }
            className="mt-7 rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white"
          >
            حفظ الإعدادات
          </button>
        </section>
      </>
    );
  }

  // ==========================================
  // Content router
  // ==========================================

  function renderContent() {
    switch (activeView) {
      case "plan":
        return renderPlan();

      case "subjects":
        return (
          <SubjectsView />
        );

      case "timer":
        return renderTimer();

      case "grades":
        return renderGrades();

      case "analytics":
        return (
          <AnalyticsView />
        );

      case "settings":
        return renderSettings();

      case "today":
      default:
        return renderToday();
    }
  }

  if (!now) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-[#86868B]"
      >
        <p className="text-sm">
          جاري تجهيز مسار...
        </p>
      </div>
    );
  }

  return (
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
              onClick={() =>
                setActiveView(
                  "today"
                )
              }
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
              {navigation.map(
                (item) => {
                  const active =
                    activeView ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        setActiveView(
                          item.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-[15px] px-3 py-3 text-sm transition ${
                        active
                          ? "bg-[#F5F5F7] font-medium text-black"
                          : "text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-black"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] text-xs">
                        {
                          item.symbol
                        }
                      </span>

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </nav>

            <div className="mt-auto border-t border-[#ECECEF] pt-4">
              <div className="rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs text-white">
                    {studentName.charAt(
                      0
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {
                        studentName
                      }
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
              onClick={() =>
                setActiveView(
                  "today"
                )
              }
              className="text-right"
            >
              <p className="text-xl font-semibold">
                مسار
              </p>

              <p className="mt-1 text-xs text-[#86868B]">
                مذاكرتك، في مسار
                واضح
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveView(
                  "timer"
                )
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
          {navigation
            .slice(0, 5)
            .map((item) => {
              const active =
                activeView ===
                item.id;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveView(
                      item.id
                    )
                  }
                  className={`rounded-[16px] px-2 py-2 text-center ${
                    active
                      ? "bg-[#F5F5F7] text-black"
                      : "text-[#86868B]"
                  }`}
                >
                  <span className="block text-sm">
                    {
                      item.symbol
                    }
                  </span>

                  <span className="mt-1 block text-[10px]">
                    {
                      item.label
                    }
                  </span>
                </button>
              );
            })}
        </div>
      </nav>
    </div>
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
  children: ReactNode;
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