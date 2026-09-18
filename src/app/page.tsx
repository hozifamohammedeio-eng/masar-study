"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import CatchUpReview from "@/components/CatchUpReview";
import CatchUpManager from "@/components/CatchUpManager";
import BackupControls from "@/components/BackupControls";
import ProgressView from "@/components/ProgressView";
import SmoothView from "@/components/SmoothView";
import SubjectsView from "@/components/SubjectsView";
import TaskManager from "@/components/TaskManager";
import WeeklyPlanEditor from "@/components/WeeklyPlanEditor";

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

import {
  loadWeakPoints,
} from "@/data/weakPointData";

import {
  isTaskOverdue,
  loadTasks,
  saveTasks,
  type StudyTask,
} from "@/data/taskData";

type View =
  | "today"
  | "subjects"
  | "tasks"
  | "timer"
  | "progress"
  | "plan"
  | "settings";

const mainNavigation: {
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
    id: "subjects",
    label: "المواد",
    symbol: "◫",
  },
  {
    id: "tasks",
    label: "المهام",
    symbol: "✓",
  },
  {
    id: "timer",
    label: "المؤقت",
    symbol: "◷",
  },
  {
    id: "progress",
    label: "تقدمي",
    symbol: "⌁",
  },
];

const inputClass =
  "mt-2 w-full rounded-[16px] border border-[#E5E5EA] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AEAEB2] focus:border-[#0071E3]";

export default function Home() {
  const [now, setNow] =
    useState<Date | null>(null);

  const [
    activeView,
    setActiveView,
  ] =
    useState<View>("today");

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    completedTasks,
    setCompletedTasks,
  ] = useState<number[]>([]);

  const [
    tasks,
    setTasks,
  ] = useState<StudyTask[]>([]);

  const [
    taskDataLoaded,
    setTaskDataLoaded,
  ] = useState(false);

  const [
    tasksLoaded,
    setTasksLoaded,
  ] = useState(false);

  const [
    studySessions,
    setStudySessions,
  ] =
    useState<StudySession[]>([]);

  const [
    openWeakPointsCount,
    setOpenWeakPointsCount,
  ] = useState(0);

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
  ] =
    useState("اللغة العربية");

  const [
    sessionGoal,
    setSessionGoal,
  ] = useState("");

  const timerStartedAtRef =
    useRef<Date | null>(null);

  const timerStartRemainingRef =
    useRef<number | null>(null);

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

  useEffect(() => {
    setTasks(loadTasks());
    setTaskDataLoaded(true);
  }, []);

  useEffect(() => {
    if (taskDataLoaded) {
      saveTasks(tasks);
    }
  }, [taskDataLoaded, tasks]);

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
  // Settings
  // ==========================================

  useEffect(() => {
    const savedName =
      localStorage.getItem(
        "masar-student-name"
      );

    if (savedName) {
      setStudentName(savedName);
    }

    const savedTimer =
      localStorage.getItem(
        "masar-timer-minutes"
      );

    if (savedTimer) {
      const parsed =
        Number(savedTimer);

      if (
        parsed === 25 ||
        parsed === 50 ||
        parsed === 5 ||
        parsed === 10
      ) {
        setTimerMinutes(parsed);

        setSecondsLeft(
          parsed * 60
        );
      }
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
  // Real data
  // ==========================================

  const refreshRealData =
    useCallback(() => {
      setStudySessions(
        loadStudySessions()
      );

      const weakPoints =
        loadWeakPoints();

      setOpenWeakPointsCount(
        weakPoints.filter(
          (point) =>
            !point.resolved
        ).length
      );
    }, []);

  useEffect(() => {
    refreshRealData();
  }, [
    activeView,
    refreshRealData,
  ]);

  const todayFocusSeconds =
    useMemo(() => {
      if (!todayKey) {
        return 0;
      }

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
  // Main timer save
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

        refreshRealData();
      },
      [
        selectedSubject,
        sessionGoal,
        refreshRealData,
      ]
    );

  // ==========================================
  // Countdown
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
  // Today progress
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
          todayPlan.tasks.length) *
          100
      );
    }, [
      completedTasks,
      todayPlan.tasks.length,
    ]);

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
  // Timer
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

    localStorage.setItem(
      "masar-timer-minutes",
      String(minutes)
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
  // Helpers
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
      totalSeconds > 0 &&
      totalSeconds < 60
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

  function saveStudentName() {
    const trimmed =
      studentName.trim();

    if (!trimmed) {
      return;
    }

    setStudentName(
      trimmed
    );

    localStorage.setItem(
      "masar-student-name",
      trimmed
    );
  }

  function navigateTo(
    view: View
  ) {
    setActiveView(view);

    setMobileMenuOpen(false);
  }

  // ==========================================
  // Today
  // ==========================================

  function renderToday() {
    const dueTodayTasks = tasks.filter(
      (task) =>
        task.dueDate === todayKey &&
        task.status !== "completed"
    );

    const overdueTasks = tasks.filter(
      (task) => isTaskOverdue(task, todayKey)
    );

    return (
      <>
        <PageHeader
          eyebrow={
            formattedDate
          }
          title={`${greeting} يا ${studentName}`}
          subtitle="دي أهم حاجة محتاج تعملها النهارده."
        />

        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <InfoCard label="تاريخ اليوم" value={formattedDate} />
          <InfoCard label="مهام اليوم" value={`${dueTodayTasks.length} مهمة`} />
          <InfoCard label="المحاضرات المطلوبة" value={todayPlan.subject ?? (todayPlan.rest ? "إجازة" : "مراجعة")} />
          <InfoCard label="المهام المتأخرة" value={`${overdueTasks.length}`} />
          <InfoCard label="ساعات المذاكرة اليوم" value={formatFocusTime(todayFocusSeconds)} />
        </section>

        <section className="mb-5 rounded-[28px] bg-[#1D1D1F] p-6 text-white sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs text-[#A1A1A6]">جلسة اليوم</p>
              <h2 className="mt-2 text-xl font-semibold">ابدأ جلسة مذاكرة مركزة</h2>
            </div>
            <button type="button" onClick={startTodaySession} className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black">بدء جلسة مذاكرة</button>
          </div>
        </section>

        {todayPlan.rest && (
          <section className="rounded-[32px] bg-[#1D1D1F] p-7 text-white sm:p-10">
            <p className="text-sm text-[#A1A1A6]">
              الجمعة
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              يوم الراحة
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#A1A1A6]">
              مفيش مذاكرة أساسية
              مطلوبة النهارده.
            </p>

            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "progress"
                )
              }
              className="mt-8 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
            >
              شوف تقدم الأسبوع
            </button>
          </section>
        )}

        {todayPlan.catchUp && (
          <CatchUpReview />
        )}

        {!todayPlan.rest &&
          !todayPlan.catchUp && (
            <div className="grid gap-5 xl:grid-cols-[1.5fr_0.65fr]">
              <section className="overflow-hidden rounded-[32px] bg-white">
                <div className="border-b border-[#ECECEF] p-6 sm:p-8">
                  <p className="text-xs font-medium text-[#0071E3]">
                    مذاكرة اليوم
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
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
                            className={`flex w-full items-center gap-4 rounded-[18px] border px-4 py-4 text-right transition-all duration-200 ${
                              completed
                                ? "border-transparent bg-[#F5F5F7]"
                                : "border-[#ECECEF] hover:border-[#D2D2D7] hover:bg-[#FAFAFA]"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
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
                              className={`text-sm transition-all duration-200 ${
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
                    <div className="mt-5 rounded-[18px] bg-[#F5F5F7] p-4">
                      <p className="text-xs text-[#86868B]">
                        اختياري
                      </p>

                      <p className="mt-2 text-sm">
                        {
                          todayPlan
                            .optionalTasks[0]
                        }
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-7">
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
                        className="h-full rounded-full bg-[#0071E3] transition-all duration-500 ease-out"
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
                    className="mt-7 w-full rounded-full bg-[#0071E3] px-6 py-4 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.01] hover:bg-[#0077ED] sm:w-auto"
                  >
                    ابدأ المذاكرة
                  </button>
                </div>
              </section>

              <div className="space-y-4">
                <InfoCard
                  label="ذاكرت النهارده"
                  value={formatFocusTime(
                    todayFocusSeconds
                  )}
                />

                <InfoCard
                  label="نقاط للمراجعة"
                  value={`${openWeakPointsCount}`}
                />

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "progress"
                    )
                  }
                  className="w-full rounded-[24px] bg-white p-5 text-right transition-all duration-200 hover:-translate-y-0.5"
                >
                  <p className="text-xs text-[#86868B]">
                    تقدمك
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#0071E3]">
                    افتح الملخص ←
                  </p>
                </button>
              </div>
            </div>
          )}

        <div className="mt-5">
          <TaskManager tasks={tasks} todayKey={todayKey} onChange={setTasks} />
        </div>
      </>
    );
  }

  function renderTasks() {
    return (
      <>
        <PageHeader eyebrow="تنظيم اليوم" title="المهام" subtitle="أضف مهامك، وحدد موعدها، وتابع حالتها حتى تكتمل." />
        <TaskManager tasks={tasks} todayKey={todayKey} onChange={setTasks} />
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
          title="الخطة الأسبوعية"
          subtitle="جدول بسيط يوضح المادة الأساسية لكل يوم."
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
                  key={plan.day}
                  className="rounded-[26px] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5"
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


                <div className="mt-5 space-y-5">
                  <WeeklyPlanEditor />
                  <CatchUpManager />
                </div>
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

                  {plan.tasks.length >
                    0 && (
                    <div className="mt-5 space-y-2">
                      {plan.tasks.map(
                        (task) => (
                          <p
                            key={
                              task
                            }
                            className="text-sm leading-6 text-[#6E6E73]"
                          >
                            — {task}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </section>
              );
            }
          )}
        </div>
      </>
    );
  }

  // ==========================================
  // Timer
  // ==========================================

  function renderTimer() {
    return (
      <>
        <PageHeader
          eyebrow="Focus"
          title="المؤقت"
          subtitle="اختار المادة، حدد هدفك، وابدأ."
        />

        <section className="mx-auto max-w-3xl rounded-[34px] bg-white p-6 sm:p-10">
          <div className="flex justify-center gap-2">
            {[25, 50, 5, 10].map(
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
                  className={`rounded-full px-4 py-2.5 text-sm transition-all duration-200 ${
                    timerMinutes ===
                    minutes
                      ? "bg-black text-white"
                      : "bg-[#F5F5F7] text-[#6E6E73] hover:bg-[#E8E8ED]"
                  } disabled:opacity-50`}
                >
                  {minutes}
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
                placeholder="هتنجز إيه؟"
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          <div className="py-12 text-center">
            <p className="text-sm text-[#86868B]">
              {
                selectedSubject
              }
            </p>

            <div
              dir="ltr"
              className="mt-6 text-[76px] font-semibold tracking-[-0.06em] sm:text-[110px]"
            >
              {formatTimer(
                secondsLeft
              )}
            </div>

            {sessionGoal && (
              <p className="mt-4 text-sm text-[#6E6E73]">
                {sessionGoal}
              </p>
            )}
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
                className="rounded-full bg-[#0071E3] px-9 py-4 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-40"
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
                className="rounded-full bg-black px-9 py-4 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02]"
              >
                إيقاف
              </button>
            )}

            <button
              type="button"
              onClick={
                resetTimer
              }
              className="rounded-full bg-[#F5F5F7] px-9 py-4 text-sm font-medium transition-all duration-200 hover:bg-[#E8E8ED]"
            >
              إعادة
            </button>
          </div>

          <div className="mt-9 border-t border-[#ECECEF] pt-6 text-center">
            <p className="text-xs text-[#86868B]">
              وقت اليوم
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
  // Settings
  // ==========================================

  function renderSettings() {
    return (
      <>
        <PageHeader
          eyebrow="Masar"
          title="الإعدادات"
          subtitle="إعدادات بسيطة للمذاكرة."
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
                  event.target.value
                )
              }
              className={
                inputClass
              }
            />
          </Field>

          <div className="mt-7">
            <p className="text-xs text-[#86868B]">
              مدة الجلسة الافتراضية
            </p>

            <div className="mt-3 flex gap-2">
              {[25, 50, 5, 10].map(
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
                    className={`rounded-full px-4 py-2.5 text-sm transition-all duration-200 ${
                      timerMinutes ===
                      minutes
                        ? "bg-black text-white"
                        : "bg-[#F5F5F7] hover:bg-[#E8E8ED]"
                    }`}
                  >
                    {minutes} دقيقة
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={
              saveStudentName
            }
            className="mt-8 rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02]"
          >
            حفظ
          </button>

          <BackupControls />
        </section>
      </>
    );
  }

  // ==========================================
  // Router
  // ==========================================

  function renderContent() {
    switch (activeView) {
      case "subjects":
        return (
          <SubjectsView />
        );

      case "tasks":
        return renderTasks();

      case "timer":
        return renderTimer();

      case "progress":
        return (
          <ProgressView />
        );

      case "plan":
        return renderPlan();

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
        className="flex min-h-screen items-center justify-center bg-[#F5F5F7] text-sm text-[#86868B]"
      >
        جاري تجهيز مسار...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]"
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[225px] shrink-0 px-5 py-6 lg:block">
          <div className="flex h-full flex-col rounded-[30px] bg-white p-4">
            <button
              type="button"
              onClick={() =>
                navigateTo(
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

            <nav className="mt-7 space-y-1">
              {mainNavigation.map(
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
                        navigateTo(
                          item.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-[15px] px-3 py-3 text-sm transition-all duration-200 ${
                        active
                          ? "bg-[#F5F5F7] font-medium text-black"
                          : "text-[#6E6E73] hover:bg-[#F5F5F7]"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center text-xs">
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
              <button
                type="button"
                onClick={() =>
                  navigateTo(
                    "plan"
                  )
                }
                className="w-full rounded-[14px] px-3 py-2.5 text-right text-xs text-[#6E6E73] transition-all duration-200 hover:bg-[#F5F5F7]"
              >
                الخطة الأسبوعية
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateTo(
                    "settings"
                  )
                }
                className="mt-1 w-full rounded-[14px] px-3 py-2.5 text-right text-xs text-[#6E6E73] transition-all duration-200 hover:bg-[#F5F5F7]"
              >
                الإعدادات
              </button>

              <div className="mt-3 flex items-center gap-3 px-3 py-2">
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

                  <p className="text-[11px] text-[#86868B]">
                    تانية بكالوريا
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
          {/* Mobile header */}
          <div className="relative mb-8 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "today"
                )
              }
              className="text-right"
            >
              <p className="text-xl font-semibold">
                مسار
              </p>

              <p className="mt-1 text-[11px] text-[#86868B]">
                مذاكرتك، في مسار واضح
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (current) =>
                    !current
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg transition-all duration-200 hover:bg-[#ECECEF]"
            >
              ···
            </button>

            {mobileMenuOpen && (
              <div className="absolute left-0 top-12 z-50 w-48 rounded-[20px] border border-black/5 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "plan"
                    )
                  }
                  className="w-full rounded-[14px] px-4 py-3 text-right text-sm transition hover:bg-[#F5F5F7]"
                >
                  الخطة الأسبوعية
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "settings"
                    )
                  }
                  className="w-full rounded-[14px] px-4 py-3 text-right text-sm transition hover:bg-[#F5F5F7]"
                >
                  الإعدادات
                </button>
              </div>
            )}
          </div>

          <SmoothView
            viewKey={
              activeView
            }
          >
            {renderContent()}
          </SmoothView>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-40 rounded-[24px] border border-black/5 bg-white/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5">
          {mainNavigation.map(
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
                    navigateTo(
                      item.id
                    )
                  }
                  className={`rounded-[16px] px-2 py-2 text-center transition-all duration-200 ${
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
            }
          )}
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
    <header className="mb-8">
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
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-[24px] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5">
      <p className="text-xs text-[#86868B]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </section>
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