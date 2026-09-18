"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getLocalDateKey,
  loadStudySessions,
} from "@/data/sessionData";

import {
  loadWeakPoints,
} from "@/data/weakPointData";

import {
  loadTasks,
  isTaskOverdue,
} from "@/data/taskData";

type Grade = {
  id: string;
  subject: string;
  type: string;
  score: number;
  total: number;
  date: string;
};

type AIReport = {
  summary: string;

  wins: string[];

  concerns: string[];

  nextWeekPriorities: string[];

  suggestedPlan: {
    subject: string;
    action: string;
  }[];
};

type SavedReport = {
  report: AIReport;
  generatedAt: string;
};

const REPORT_STORAGE_KEY =
  "masar-ai-weekly-report";

function loadGrades(): Grade[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        localStorage.getItem(
          "masar-grades"
        ) ?? "[]"
      );

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function getWeekRange() {
  const today = new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6
    );

  return {
    from:
      getLocalDateKey(start),

    to:
      getLocalDateKey(today),
  };
}

export default function AIWeeklyReport() {
  const [
    accessCode,
    setAccessCode,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    savedReport,
    setSavedReport,
  ] =
    useState<SavedReport | null>(
      null
    );

  useEffect(() => {
    const saved =
      localStorage.getItem(
        REPORT_STORAGE_KEY
      );

    if (!saved) {
      return;
    }

    try {
      const parsed =
        JSON.parse(saved);

      if (
        parsed &&
        typeof parsed ===
          "object" &&
        parsed.report
      ) {
        setSavedReport(
          parsed
        );
      }
    } catch {
      localStorage.removeItem(
        REPORT_STORAGE_KEY
      );
    }
  }, []);

  const snapshot =
    useMemo(() => {
      const range =
        getWeekRange();

      const sessions =
        loadStudySessions();

      const weeklySessions =
        sessions.filter(
          (session) =>
            session.dateKey >=
              range.from &&
            session.dateKey <=
              range.to
        );

      const totalSeconds =
        weeklySessions.reduce(
          (
            total,
            session
          ) =>
            total +
            session.durationSeconds,
          0
        );

      const subjectMap =
        new Map<
          string,
          {
            name: string;
            seconds: number;
            sessions: number;
          }
        >();

      weeklySessions.forEach(
        (session) => {
          const current =
            subjectMap.get(
              session.subjectId
            );

          if (current) {
            current.seconds +=
              session.durationSeconds;

            current.sessions += 1;
          } else {
            subjectMap.set(
              session.subjectId,
              {
                name:
                  session.subjectName,

                seconds:
                  session.durationSeconds,

                sessions: 1,
              }
            );
          }
        }
      );

      const subjects =
        Array.from(
          subjectMap.values()
        ).map(
          (subject) => ({
            name: subject.name,

            studyMinutes:
              Math.round(
                subject.seconds /
                  60
              ),

            sessions:
              subject.sessions,
          })
        );

      const tasks =
        loadTasks();

      const completedTasks =
        tasks.filter(
          (task) =>
            task.status ===
            "completed"
        ).length;

      const overdueTasks =
        tasks.filter(
          (task) =>
            isTaskOverdue(
              task,
              range.to
            )
        ).length;

      const grades =
        loadGrades()
          .filter((grade) => {
            const date =
              getLocalDateKey(
                new Date(
                  grade.date
                )
              );

            return (
              date >=
                range.from &&
              date <= range.to
            );
          })
          .map((grade) => ({
            subject:
              grade.subject,

            type:
              grade.type,

            score:
              grade.score,

            total:
              grade.total,

            percentage:
              grade.total > 0
                ? Math.round(
                    (grade.score /
                      grade.total) *
                      100
                  )
                : 0,
          }));

      const weakPoints =
        loadWeakPoints()
          .filter(
            (point) =>
              !point.resolved
          )
          .slice(0, 20)
          .map((point) => ({
            subject:
              point.subjectName,

            lesson:
              point.lessonTitle,

            note:
              point.note,

            priority:
              point.priority,
          }));

      return {
        period: {
          from: range.from,
          to: range.to,
        },

        totalStudyMinutes:
          Math.round(
            totalSeconds / 60
          ),

        sessionsCount:
          weeklySessions.length,

        subjects,

        tasks: {
          total:
            tasks.length,

          completed:
            completedTasks,

          overdue:
            overdueTasks,
        },

        grades,

        weakPoints,
      };
    }, []);

  const hasUsefulData =
    snapshot.sessionsCount >
      0 ||
    snapshot.tasks.total > 0 ||
    snapshot.grades.length >
      0 ||
    snapshot.weakPoints.length >
      0;

  async function generateReport() {
    setError("");

    if (!accessCode.trim()) {
      setError(
        "اكتب كود الذكاء الاصطناعي الأول."
      );

      return;
    }

    if (!hasUsefulData) {
      setError(
        "لسه مفيش بيانات كفاية نعمل منها تقرير."
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/weekly-report",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "x-masar-ai-code":
                accessCode.trim(),
            },

            body: JSON.stringify({
              snapshot,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "مقدرناش نعمل التقرير."
        );
      }

      const nextSavedReport:
        SavedReport = {
        report: data.report,

        generatedAt:
          data.generatedAt,
      };

      setSavedReport(
        nextSavedReport
      );

      localStorage.setItem(
        REPORT_STORAGE_KEY,
        JSON.stringify(
          nextSavedReport
        )
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "حصل خطأ غير متوقع."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatGeneratedDate(
    value: string
  ) {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "ar-EG",
      {
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
  }

  return (
    <section className="mt-5 overflow-hidden rounded-[30px] bg-[#1D1D1F] text-white">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-medium text-[#8ABEFF]">
              Masar Intelligence
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              تقرير مسار الذكي
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-7 text-[#A1A1A6]">
              تحليل مبني على
              مذاكرتك ودرجاتك
              ومهامك ونقاط
              المراجعة الحقيقية.
            </p>
          </div>

          <div className="rounded-full bg-white/10 px-4 py-2 text-xs text-[#D1D1D6]">
            آخر 7 أيام
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <MiniStat
            label="وقت المذاكرة"
            value={`${snapshot.totalStudyMinutes} د`}
          />

          <MiniStat
            label="الجلسات"
            value={`${snapshot.sessionsCount}`}
          />

          <MiniStat
            label="نقاط للمراجعة"
            value={`${snapshot.weakPoints.length}`}
          />
        </div>

        {!savedReport && (
          <div className="mt-7 rounded-[22px] bg-white/5 p-5">
            <label className="block">
              <span className="text-xs text-[#A1A1A6]">
                كود التقرير السري
              </span>

              <input
                type="password"
                value={
                  accessCode
                }
                onChange={(
                  event
                ) =>
                  setAccessCode(
                    event.target
                      .value
                  )
                }
                placeholder="اكتب الكود اللي اخترته"
                autoComplete="off"
                className="mt-3 w-full rounded-[16px] border border-white/10 bg-white/10 px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#6E6E73] focus:border-[#0071E3]"
              />
            </label>

            <button
              type="button"
              disabled={loading}
              onClick={
                generateReport
              }
              className="mt-4 w-full rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading
                ? "مسار بيحلل أسبوعك..."
                : "حلّل أسبوعي بالذكاء الاصطناعي"}
            </button>
          </div>
        )}

        {savedReport && (
          <div className="mt-7 space-y-4">
            <div className="rounded-[22px] bg-white p-5 text-[#1D1D1F]">
              <p className="text-xs text-[#86868B]">
                ملخص الأسبوع
              </p>

              <p className="mt-3 text-sm leading-7">
                {
                  savedReport
                    .report
                    .summary
                }
              </p>
            </div>

            <ReportList
              title="الحاجات اللي ماشية كويس"
              items={
                savedReport
                  .report.wins
              }
            />

            <ReportList
              title="محتاج تركز على"
              items={
                savedReport
                  .report
                  .concerns
              }
            />

            <ReportList
              title="أولويات الأسبوع الجاي"
              items={
                savedReport
                  .report
                  .nextWeekPriorities
              }
            />

            {savedReport.report
              .suggestedPlan
              .length > 0 && (
              <div className="rounded-[22px] bg-white/5 p-5">
                <p className="text-sm font-medium">
                  الخطة المقترحة
                </p>

                <div className="mt-4 space-y-3">
                  {savedReport.report
                    .suggestedPlan
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={`${item.subject}-${index}`}
                          className="rounded-[16px] bg-white/10 p-4"
                        >
                          <p className="text-sm font-medium">
                            {
                              item.subject
                            }
                          </p>

                          <p className="mt-2 text-xs leading-6 text-[#D1D1D6]">
                            {
                              item.action
                            }
                          </p>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#86868B]">
                آخر تقرير:{" "}
                {formatGeneratedDate(
                  savedReport.generatedAt
                )}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSavedReport(
                    null
                  );

                  setError("");
                }}
                className="rounded-full bg-white/10 px-4 py-2.5 text-xs transition hover:bg-white/15"
              >
                إنشاء تقرير جديد
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-[16px] bg-white/10 px-4 py-3 text-sm text-[#FFD1D1]">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] bg-white/5 p-4">
      <p className="text-xs text-[#A1A1A6]">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

function ReportList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return null;
  }

  return (
    <div className="rounded-[22px] bg-white/5 p-5">
      <p className="text-sm font-medium">
        {title}
      </p>

      <div className="mt-4 space-y-3">
        {items.map(
          (item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-6 text-[#D1D1D6]"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0071E3]" />

              <p>{item}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}