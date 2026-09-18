"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  addStudySession,
  getFocusSecondsForLesson,
  type StudyContext,
} from "@/data/sessionData";

type Props = {
  context: StudyContext;
  onClose: () => void;
};

export default function LessonStudyTimer({
  context,
  onClose,
}: Props) {
  const [timerMinutes, setTimerMinutes] =
    useState(50);

  const [secondsLeft, setSecondsLeft] =
    useState(50 * 60);

  const [running, setRunning] =
    useState(false);

  const [goal, setGoal] = useState(
    context.goal ??
      context.lessonTitle ??
      ""
  );

  const [
    lessonFocusSeconds,
    setLessonFocusSeconds,
  ] = useState(0);

  const startedAtRef =
    useRef<Date | null>(null);

  const startRemainingRef =
    useRef<number | null>(null);

  const refreshLessonTime =
    useCallback(() => {
      if (!context.lessonId) {
        setLessonFocusSeconds(0);
        return;
      }

      setLessonFocusSeconds(
        getFocusSecondsForLesson(
          context.lessonId
        )
      );
    }, [context.lessonId]);

  useEffect(() => {
    refreshLessonTime();
  }, [refreshLessonTime]);

  const saveCurrentSegment =
    useCallback(
      (remainingSeconds: number) => {
        const startedAt =
          startedAtRef.current;

        const startRemaining =
          startRemainingRef.current;

        if (
          !startedAt ||
          startRemaining === null
        ) {
          return;
        }

        const durationSeconds =
          Math.max(
            0,
            startRemaining -
              remainingSeconds
          );

        if (durationSeconds > 0) {
          addStudySession({
            context: {
              ...context,
              goal,
            },
            startedAt,
            endedAt: new Date(),
            durationSeconds,
          });
        }

        startedAtRef.current = null;
        startRemainingRef.current =
          null;

        refreshLessonTime();
      },
      [
        context,
        goal,
        refreshLessonTime,
      ]
    );

  useEffect(() => {
    if (!running) return;

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
  }, [running]);

  useEffect(() => {
    if (
      running &&
      secondsLeft === 0
    ) {
      saveCurrentSegment(0);
      setRunning(false);
    }
  }, [
    running,
    secondsLeft,
    saveCurrentSegment,
  ]);

  function startTimer() {
    if (
      running ||
      secondsLeft <= 0
    ) {
      return;
    }

    startedAtRef.current =
      new Date();

    startRemainingRef.current =
      secondsLeft;

    setRunning(true);
  }

  function pauseTimer() {
    if (!running) return;

    saveCurrentSegment(
      secondsLeft
    );

    setRunning(false);
  }

  function resetTimer() {
    if (running) {
      saveCurrentSegment(
        secondsLeft
      );
    }

    setRunning(false);

    setSecondsLeft(
      timerMinutes * 60
    );
  }

  function changeDuration(
    minutes: number
  ) {
    if (running) return;

    setTimerMinutes(minutes);

    setSecondsLeft(
      minutes * 60
    );
  }

  function finishSession() {
    if (running) {
      saveCurrentSegment(
        secondsLeft
      );
    }

    setRunning(false);
    onClose();
  }

  function formatTimer(
    totalSeconds: number
  ) {
    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds =
      totalSeconds % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  function formatFocusTime(
    totalSeconds: number
  ) {
    const minutes = Math.floor(
      totalSeconds / 60
    );

    if (minutes === 0) {
      return "0 دقيقة";
    }

    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remaining =
      minutes % 60;

    if (remaining === 0) {
      return `${hours} ساعة`;
    }

    return `${hours} س ${remaining} د`;
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
    >
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-[34px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-[#0071E3]">
              جلسة مذاكرة
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {context.lessonTitle ??
                context.subjectName}
            </h2>

            <p className="mt-2 text-sm text-[#86868B]">
              {context.subjectName}
            </p>

            {context.unitTitle && (
              <p className="mt-1 text-xs text-[#AEAEB2]">
                {context.unitTitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={finishSession}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-lg text-[#6E6E73] transition hover:bg-[#E8E8ED]"
          >
            ×
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {[25, 50, 55].map(
            (minutes) => (
              <button
                key={minutes}
                type="button"
                disabled={running}
                onClick={() =>
                  changeDuration(
                    minutes
                  )
                }
                className={`rounded-full px-4 py-2.5 text-sm transition ${
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

        <div className="mt-7">
          <label className="text-xs text-[#86868B]">
            هدف الجلسة
          </label>

          <input
            value={goal}
            disabled={running}
            onChange={(event) =>
              setGoal(
                event.target.value
              )
            }
            placeholder="هتنجز إيه في الجلسة؟"
            className="mt-2 w-full rounded-[16px] border border-[#E5E5EA] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AEAEB2] focus:border-[#0071E3]"
          />
        </div>

        <div className="py-12 text-center">
          <p className="text-xs text-[#86868B]">
            وقت التركيز
          </p>

          <div
            dir="ltr"
            className="mt-5 text-[72px] font-semibold tracking-[-0.06em] text-black sm:text-[100px]"
          >
            {formatTimer(
              secondsLeft
            )}
          </div>

          {secondsLeft === 0 && (
            <p className="mt-3 text-sm font-medium text-[#34C759]">
              انتهت الجلسة ✓
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {!running ? (
            <button
              type="button"
              disabled={
                secondsLeft === 0
              }
              onClick={startTimer}
              className="rounded-full bg-[#0071E3] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {secondsLeft ===
              timerMinutes * 60
                ? "ابدأ"
                : "استكمال"}
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseTimer}
              className="rounded-full bg-black px-8 py-4 text-sm font-medium text-white"
            >
              إيقاف مؤقت
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            className="rounded-full bg-[#F5F5F7] px-8 py-4 text-sm font-medium text-[#1D1D1F]"
          >
            إعادة
          </button>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-[#F5F5F7] p-5">
            <p className="text-xs text-[#86868B]">
              وقت المذاكرة المسجل للدرس
            </p>

            <p className="mt-2 text-lg font-semibold">
              {formatFocusTime(
                lessonFocusSeconds
              )}
            </p>
          </div>

          <div className="rounded-[20px] bg-[#F5F5F7] p-5">
            <p className="text-xs text-[#86868B]">
              البيانات المسجلة
            </p>

            <p className="mt-2 text-sm font-medium">
              المادة + الدرس + الوقت
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={finishSession}
          className="mt-6 w-full rounded-full border border-[#D2D2D7] px-6 py-3.5 text-sm font-medium transition hover:bg-[#F5F5F7]"
        >
          إنهاء الجلسة والرجوع للدرس
        </button>
      </div>
    </div>
  );
}