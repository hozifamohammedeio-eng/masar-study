"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { curriculum } from "@/data/curriculumData";

import {
  getLocalDateKey,
  loadStudySessions,
  type StudySession,
} from "@/data/sessionData";

function formatDuration(
  seconds: number
) {
  if (seconds <= 0) {
    return "0 دقيقة";
  }

  if (seconds < 60) {
    return "أقل من دقيقة";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

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

function getLastSevenDays() {
  const days: {
    dateKey: string;
    label: string;
  }[] = [];

  const today =
    new Date();

  for (
    let index = 6;
    index >= 0;
    index -= 1
  ) {
    const date =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() -
          index
      );

    days.push({
      dateKey:
        getLocalDateKey(date),

      label:
        new Intl.DateTimeFormat(
          "ar-EG",
          {
            weekday: "short",
          }
        ).format(date),
    });
  }

  return days;
}

export default function AnalyticsView() {
  const [
    sessions,
    setSessions,
  ] =
    useState<StudySession[]>(
      []
    );

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    setSessions(
      loadStudySessions()
    );

    setLoaded(true);
  }, []);

  const todayKey =
    getLocalDateKey();

  const lastSevenDays =
    useMemo(
      () =>
        getLastSevenDays(),
      []
    );

  const lastSevenDateKeys =
    useMemo(
      () =>
        lastSevenDays.map(
          (day) =>
            day.dateKey
        ),
      [lastSevenDays]
    );

  const todaySessions =
    useMemo(
      () =>
        sessions.filter(
          (session) =>
            session.dateKey ===
            todayKey
        ),
      [
        sessions,
        todayKey,
      ]
    );

  const todaySeconds =
    useMemo(
      () =>
        todaySessions.reduce(
          (
            total,
            session
          ) =>
            total +
            session.durationSeconds,
          0
        ),
      [todaySessions]
    );

  const weeklySessions =
    useMemo(
      () =>
        sessions.filter(
          (session) =>
            lastSevenDateKeys.includes(
              session.dateKey
            )
        ),
      [
        sessions,
        lastSevenDateKeys,
      ]
    );

  const weeklySeconds =
    useMemo(
      () =>
        weeklySessions.reduce(
          (
            total,
            session
          ) =>
            total +
            session.durationSeconds,
          0
        ),
      [weeklySessions]
    );

  const subjectStats =
    useMemo(() => {
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
              (
                total,
                session
              ) =>
                total +
                session.durationSeconds,
              0
            );

          return {
            id: subject.id,
            name: subject.name,
            teacher:
              subject.teacher,
            seconds,
            sessions:
              subjectSessions.length,
          };
        }
      );
    }, [sessions]);

  const studiedSubjects =
    useMemo(
      () =>
        subjectStats.filter(
          (subject) =>
            subject.seconds > 0
        ),
      [subjectStats]
    );

  const mostStudiedSubject =
    useMemo(() => {
      if (
        studiedSubjects.length ===
        0
      ) {
        return null;
      }

      return [
        ...studiedSubjects,
      ].sort(
        (a, b) =>
          b.seconds -
          a.seconds
      )[0];
    }, [studiedSubjects]);

  const dailyStats =
    useMemo(
      () =>
        lastSevenDays.map(
          (day) => {
            const seconds =
              sessions
                .filter(
                  (session) =>
                    session.dateKey ===
                    day.dateKey
                )
                .reduce(
                  (
                    total,
                    session
                  ) =>
                    total +
                    session.durationSeconds,
                  0
                );

            return {
              ...day,
              seconds,
            };
          }
        ),
      [
        sessions,
        lastSevenDays,
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
          .slice(0, 5),
      [sessions]
    );

  if (!loaded) {
    return (
      <div className="rounded-[26px] bg-white p-6 text-sm text-[#86868B]">
        جاري تحميل بياناتك...
      </div>
    );
  }

  return (
    <>
      {/* Quick overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="اليوم"
          value={formatDuration(
            todaySeconds
          )}
          note={
            todaySessions.length >
            0
              ? `${todaySessions.length} جلسة`
              : "مفيش جلسات لسه"
          }
        />

        <StatCard
          label="آخر 7 أيام"
          value={formatDuration(
            weeklySeconds
          )}
          note={
            weeklySessions.length >
            0
              ? `${weeklySessions.length} جلسة`
              : "مفيش بيانات كفاية"
          }
        />

        <StatCard
          label="أكتر مادة ذاكرتها"
          value={
            mostStudiedSubject
              ? mostStudiedSubject.name
              : "لسه مفيش"
          }
          note={
            mostStudiedSubject
              ? formatDuration(
                  mostStudiedSubject.seconds
                )
              : "ابدأ أول جلسة"
          }
        />
      </div>

      {/* Week */}
      <section className="mt-5 rounded-[28px] bg-white p-6 sm:p-7">
        <div>
          <h2 className="text-lg font-semibold">
            الأسبوع ده
          </h2>

          <p className="mt-1 text-xs text-[#86868B]">
            وقت المذاكرة في آخر 7 أيام
          </p>
        </div>

        <div className="mt-8 flex h-[190px] items-end gap-3">
          {dailyStats.map(
            (day) => {
              const height =
                day.seconds === 0
                  ? 5
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
                  <div className="flex h-[125px] w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[42px] rounded-t-[10px] ${
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

      {/* Subjects */}
      <section className="mt-5 rounded-[28px] bg-white p-6 sm:p-7">
        <h2 className="text-lg font-semibold">
          المواد
        </h2>

        <p className="mt-1 text-xs text-[#86868B]">
          الوقت اللي سجلته لكل مادة
        </p>

        <div className="mt-6 space-y-3">
          {subjectStats.map(
            (subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between gap-4 rounded-[18px] bg-[#F5F5F7] p-4"
              >
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

                <div className="text-left">
                  <p className="text-sm font-semibold">
                    {formatDuration(
                      subject.seconds
                    )}
                  </p>

                  <p className="mt-1 text-xs text-[#86868B]">
                    {
                      subject.sessions
                    }{" "}
                    جلسة
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Recent sessions */}
      <section className="mt-5 rounded-[28px] bg-white p-6 sm:p-7">
        <h2 className="text-lg font-semibold">
          آخر الجلسات
        </h2>

        {recentSessions.length ===
        0 ? (
          <div className="mt-5 rounded-[20px] bg-[#F5F5F7] px-5 py-9 text-center">
            <p className="text-sm text-[#86868B]">
              مفيش جلسات مسجلة لسه.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {recentSessions.map(
              (session) => (
                <div
                  key={
                    session.id
                  }
                  className="flex items-center justify-between gap-4 rounded-[18px] border border-[#ECECEF] p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {session.lessonTitle ??
                        session.subjectName}
                    </p>

                    <p className="mt-1 text-xs text-[#86868B]">
                      {
                        session.subjectName
                      }
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium">
                    {formatDuration(
                      session.durationSeconds
                    )}
                  </p>
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
    <section className="rounded-[24px] bg-white p-5">
      <p className="text-xs text-[#86868B]">
        {label}
      </p>

      <p className="mt-3 text-xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-[#86868B]">
        {note}
      </p>
    </section>
  );
}