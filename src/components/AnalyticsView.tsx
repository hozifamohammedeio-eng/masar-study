"use client";

import { useEffect, useMemo, useState } from "react";

import { curriculum } from "@/data/curriculumData";

import {
  getLocalDateKey,
  loadStudySessions,
  type StudySession,
} from "@/data/sessionData";

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return "أقل من دقيقة";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ساعة`;
  }

  return `${hours} س ${remainingMinutes} د`;
}

function getLastSevenDateKeys() {
  const result: string[] = [];

  const today = new Date();

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - index
    );

    result.push(getLocalDateKey(date));
  }

  return result;
}

function getShortDayName(dateKey: string) {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "short",
  }).format(date);
}

export default function AnalyticsView() {
  const [sessions, setSessions] =
    useState<StudySession[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    setSessions(loadStudySessions());
    setLoaded(true);
  }, []);

  const todayKey = getLocalDateKey();

  const todaySessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.dateKey === todayKey
      ),
    [sessions, todayKey]
  );

  const todayFocusSeconds = useMemo(
    () =>
      todaySessions.reduce(
        (total, session) =>
          total +
          session.durationSeconds,
        0
      ),
    [todaySessions]
  );

  const lastSevenDateKeys = useMemo(
    () => getLastSevenDateKeys(),
    []
  );

  const lastSevenSessions = useMemo(
    () =>
      sessions.filter((session) =>
        lastSevenDateKeys.includes(
          session.dateKey
        )
      ),
    [sessions, lastSevenDateKeys]
  );

  const weekFocusSeconds = useMemo(
    () =>
      lastSevenSessions.reduce(
        (total, session) =>
          total +
          session.durationSeconds,
        0
      ),
    [lastSevenSessions]
  );

  const subjectStats = useMemo(() => {
    return curriculum.map(
      (subject) => {
        const subjectSessions =
          sessions.filter(
            (session) =>
              session.subjectId ===
              subject.id
          );

        const seconds =
          subjectSessions.reduce(
            (total, session) =>
              total +
              session.durationSeconds,
            0
          );

        const lessonIds = new Set(
          subjectSessions
            .map(
              (session) =>
                session.lessonId
            )
            .filter(
              (
                lessonId
              ): lessonId is string =>
                Boolean(lessonId)
            )
        );

        return {
          id: subject.id,
          name: subject.name,
          teacher: subject.teacher,
          seconds,
          sessions:
            subjectSessions.length,
          studiedLessons:
            lessonIds.size,
        };
      }
    );
  }, [sessions]);

  const totalTrackedSeconds =
    useMemo(
      () =>
        subjectStats.reduce(
          (total, subject) =>
            total +
            subject.seconds,
          0
        ),
      [subjectStats]
    );

  const mostStudiedSubject =
    useMemo(() => {
      const studied =
        subjectStats.filter(
          (subject) =>
            subject.seconds > 0
        );

      if (studied.length === 0) {
        return null;
      }

      return [...studied].sort(
        (a, b) =>
          b.seconds - a.seconds
      )[0];
    }, [subjectStats]);

  const dailyStats = useMemo(
    () =>
      lastSevenDateKeys.map(
        (dateKey) => {
          const seconds =
            sessions
              .filter(
                (session) =>
                  session.dateKey ===
                  dateKey
              )
              .reduce(
                (total, session) =>
                  total +
                  session.durationSeconds,
                0
              );

          return {
            dateKey,
            label:
              getShortDayName(
                dateKey
              ),
            seconds,
          };
        }
      ),
    [
      sessions,
      lastSevenDateKeys,
    ]
  );

  const maxDailySeconds =
    useMemo(
      () =>
        Math.max(
          ...dailyStats.map(
            (day) =>
              day.seconds
          ),
          1
        ),
      [dailyStats]
    );

  const recentSessions =
    useMemo(
      () =>
        [...sessions]
          .sort(
            (a, b) =>
              new Date(
                b.endedAt
              ).getTime() -
              new Date(
                a.endedAt
              ).getTime()
          )
          .slice(0, 6),
      [sessions]
    );

  if (!loaded) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm text-[#86868B]">
        جاري تحميل التحليلات...
      </div>
    );
  }

  return (
    <>
      <header className="mb-9">
        <p className="mb-2 text-sm text-[#86868B]">
          Analytics
        </p>

        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[46px]">
          التحليلات
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6E6E73]">
          كل الأرقام هنا ناتجة عن جلسات
          مذاكرة سجلتها فعليًا داخل مسار.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="وقت التركيز اليوم"
          value={
            todayFocusSeconds > 0
              ? formatDuration(
                  todayFocusSeconds
                )
              : "لا توجد جلسات"
          }
          note={
            todaySessions.length > 0
              ? `${todaySessions.length} جلسة مسجلة`
              : "ابدأ أول جلسة مذاكرة اليوم."
          }
        />

        <StatCard
          label="آخر 7 أيام"
          value={
            weekFocusSeconds > 0
              ? formatDuration(
                  weekFocusSeconds
                )
              : "لا توجد بيانات"
          }
          note={
            lastSevenSessions.length >
            0
              ? `${lastSevenSessions.length} جلسة`
              : "لسه مفيش جلسات خلال الأسبوع."
          }
        />

        <StatCard
          label="إجمالي الجلسات"
          value={`${sessions.length}`}
          note="عدد جلسات المذاكرة المحفوظة."
        />

        <StatCard
          label="أكثر مادة مذاكرة"
          value={
            mostStudiedSubject
              ? mostStudiedSubject.name
              : "لا توجد بيانات"
          }
          note={
            mostStudiedSubject
              ? formatDuration(
                  mostStudiedSubject.seconds
                )
              : "ابدأ جلسات مذاكرة أولًا."
          }
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[30px] bg-white p-6 sm:p-7">
          <div>
            <p className="text-xs text-[#86868B]">
              آخر 7 أيام
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              وقت المذاكرة
            </h2>
          </div>

          <div className="mt-8 flex h-[220px] items-end gap-3">
            {dailyStats.map(
              (day) => {
                const height =
                  day.seconds === 0
                    ? 4
                    : Math.max(
                        12,
                        Math.round(
                          (day.seconds /
                            maxDailySeconds) *
                            100
                        )
                      );

                return (
                  <div
                    key={
                      day.dateKey
                    }
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <p className="mb-3 min-h-[32px] text-center text-[10px] text-[#86868B]">
                      {day.seconds >
                      0
                        ? formatDuration(
                            day.seconds
                          )
                        : ""}
                    </p>

                    <div className="flex h-[140px] w-full items-end justify-center">
                      <div
                        className={`w-full max-w-[44px] rounded-t-[12px] transition-all ${
                          day.seconds >
                          0
                            ? "bg-[#0071E3]"
                            : "bg-[#E8E8ED]"
                        }`}
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-[#86868B]">
                      {day.label}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section className="rounded-[30px] bg-[#1D1D1F] p-6 text-white sm:p-7">
          <p className="text-xs text-[#A1A1A6]">
            إجمالي وقت المذاكرة
          </p>

          <p className="mt-3 text-3xl font-semibold">
            {totalTrackedSeconds >
            0
              ? formatDuration(
                  totalTrackedSeconds
                )
              : "0 دقيقة"}
          </p>

          <p className="mt-3 text-sm leading-6 text-[#A1A1A6]">
            ده الوقت المسجل من جلسات
            الدراسة المرتبطة بالمواد
            والدروس.
          </p>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-xs text-[#A1A1A6]">
              التقرير الذكي
            </p>

            <p className="mt-2 text-sm">
              لسه غير مفعّل
            </p>

            <p className="mt-2 text-xs leading-5 text-[#A1A1A6]">
              هنفعّله لما يبقى عندنا
              بيانات كفاية عن المذاكرة
              والدرجات ونقاط الضعف.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-[30px] bg-white p-6 sm:p-7">
        <div>
          <p className="text-xs text-[#86868B]">
            Subjects
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            الوقت حسب المادة
          </h2>
        </div>

        <div className="mt-7 space-y-3">
          {subjectStats.map(
            (subject) => {
              const width =
                totalTrackedSeconds ===
                0
                  ? 0
                  : Math.round(
                      (subject.seconds /
                        totalTrackedSeconds) *
                        100
                    );

              return (
                <div
                  key={subject.id}
                  className="rounded-[20px] bg-[#F5F5F7] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-medium">
                        {
                          subject.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-[#86868B]">
                        {
                          subject.teacher
                        }
                      </p>
                    </div>

                    <div className="sm:text-left">
                      <p className="text-sm font-semibold">
                        {subject.seconds >
                        0
                          ? formatDuration(
                              subject.seconds
                            )
                          : "0 دقيقة"}
                      </p>

                      <p className="mt-1 text-xs text-[#86868B]">
                        {
                          subject.sessions
                        }{" "}
                        جلسة ·{" "}
                        {
                          subject.studiedLessons
                        }{" "}
                        درس
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-[#DCDCE1]">
                    <div
                      className="h-full rounded-full bg-[#0071E3]"
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      <section className="mt-5 rounded-[30px] bg-white p-6 sm:p-7">
        <div>
          <p className="text-xs text-[#86868B]">
            Activity
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            آخر جلسات المذاكرة
          </h2>
        </div>

        {recentSessions.length ===
        0 ? (
          <div className="mt-6 rounded-[22px] bg-[#F5F5F7] px-5 py-10 text-center">
            <p className="text-sm text-[#86868B]">
              مفيش جلسات مذاكرة
              مسجلة لسه.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {recentSessions.map(
              (session) => (
                <div
                  key={session.id}
                  className="flex flex-col justify-between gap-4 rounded-[20px] border border-[#ECECEF] p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {session.lessonTitle ??
                        session.subjectName}
                    </p>

                    <p className="mt-1 text-xs text-[#86868B]">
                      {
                        session.subjectName
                      }
                    </p>

                    {session.goal && (
                      <p className="mt-2 text-xs text-[#AEAEB2]">
                        الهدف:{" "}
                        {session.goal}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-left">
                    <p className="text-sm font-semibold">
                      {formatDuration(
                        session.durationSeconds
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#86868B]">
                      {new Intl.DateTimeFormat(
                        "ar-EG",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute:
                            "2-digit",
                        }
                      ).format(
                        new Date(
                          session.endedAt
                        )
                      )}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <section className="rounded-[26px] bg-white p-5">
      <p className="text-xs text-[#86868B]">
        {label}
      </p>

      <p className="mt-3 text-xl font-semibold tracking-tight text-[#1D1D1F]">
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-[#86868B]">
        {note}
      </p>
    </section>
  );
}