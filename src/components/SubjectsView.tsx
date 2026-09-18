"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import LessonStudyTimer from "@/components/LessonStudyTimer";
import LessonWeakPoints from "@/components/LessonWeakPoints";

import { curriculum } from "@/data/curriculumData";

import {
  getSubjectWorkflow,
} from "@/data/workflowData";

import {
  loadStudySessions,
  type StudyContext,
  type StudySession,
} from "@/data/sessionData";

const WORKFLOW_STORAGE_KEY =
  "masar-lesson-workflow-progress";

const OLD_COMPLETION_STORAGE_KEY =
  "masar-curriculum-completion";

type LessonProgress =
  Record<string, string[]>;

export default function SubjectsView() {
  const [
    selectedSubjectId,
    setSelectedSubjectId,
  ] = useState<string | null>(
    null
  );

  const [
    selectedLessonId,
    setSelectedLessonId,
  ] = useState<string | null>(
    null
  );

  const [
    openUnitId,
    setOpenUnitId,
  ] = useState<string | null>(
    null
  );

  const [
    lessonProgress,
    setLessonProgress,
  ] =
    useState<LessonProgress>(
      {}
    );

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    studyContext,
    setStudyContext,
  ] =
    useState<StudyContext | null>(
      null
    );

  const [sessions, setSessions] = useState<StudySession[]>([]);

  // ==========================================
  // Load progress
  // ==========================================

  useEffect(() => {
    setSessions(loadStudySessions());
    let nextProgress:
      LessonProgress = {};

    const savedWorkflow =
      localStorage.getItem(
        WORKFLOW_STORAGE_KEY
      );

    if (savedWorkflow) {
      try {
        const parsed =
          JSON.parse(
            savedWorkflow
          );

        if (
          parsed &&
          typeof parsed ===
            "object" &&
          !Array.isArray(
            parsed
          )
        ) {
          nextProgress =
            parsed as LessonProgress;
        }
      } catch {
        nextProgress = {};
      }
    }

    const oldCompletion =
      localStorage.getItem(
        OLD_COMPLETION_STORAGE_KEY
      );

    let oldCompletedLessons:
      string[] = [];

    if (oldCompletion) {
      try {
        const parsed =
          JSON.parse(
            oldCompletion
          );

        if (
          Array.isArray(
            parsed
          )
        ) {
          oldCompletedLessons =
            parsed;
        }
      } catch {
        oldCompletedLessons =
          [];
      }
    }

    curriculum.forEach(
      (subject) => {
        const workflow =
          getSubjectWorkflow(
            subject.id
          );

        const workflowIds =
          workflow.map(
            (step) =>
              step.id
          );

        subject.units.forEach(
          (unit) => {
            unit.lessons.forEach(
              (lesson) => {
                if (
                  oldCompletedLessons.includes(
                    lesson.id
                  ) &&
                  !nextProgress[
                    lesson.id
                  ]
                ) {
                  nextProgress[
                    lesson.id
                  ] =
                    workflowIds;
                }
              }
            );
          }
        );
      }
    );

    setLessonProgress(
      nextProgress
    );

    setLoaded(true);
  }, []);

  // ==========================================
  // Save progress
  // ==========================================

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      WORKFLOW_STORAGE_KEY,
      JSON.stringify(
        lessonProgress
      )
    );

    const completedLessonIds:
      string[] = [];

    curriculum.forEach(
      (subject) => {
        const workflow =
          getSubjectWorkflow(
            subject.id
          );

        const workflowIds =
          workflow.map(
            (step) =>
              step.id
          );

        subject.units.forEach(
          (unit) => {
            unit.lessons.forEach(
              (lesson) => {
                const completedSteps =
                  lessonProgress[
                    lesson.id
                  ] ?? [];

                const isComplete =
                  workflowIds.length >
                    0 &&
                  workflowIds.every(
                    (stepId) =>
                      completedSteps.includes(
                        stepId
                      )
                  );

                if (isComplete) {
                  completedLessonIds.push(
                    lesson.id
                  );
                }
              }
            );
          }
        );
      }
    );

    localStorage.setItem(
      OLD_COMPLETION_STORAGE_KEY,
      JSON.stringify(
        completedLessonIds
      )
    );
  }, [
    lessonProgress,
    loaded,
  ]);

  const selectedSubject =
    useMemo(() => {
      if (
        !selectedSubjectId
      ) {
        return null;
      }

      return curriculum.find(
        (subject) =>
          subject.id ===
          selectedSubjectId
      );
    }, [
      selectedSubjectId,
    ]);

  const selectedLessonData =
    useMemo(() => {
      if (
        !selectedSubject ||
        !selectedLessonId
      ) {
        return null;
      }

      for (
        const unit of
        selectedSubject.units
      ) {
        const lesson =
          unit.lessons.find(
            (item) =>
              item.id ===
              selectedLessonId
          );

        if (lesson) {
          return {
            lesson,
            unit,
          };
        }
      }

      return null;
    }, [
      selectedSubject,
      selectedLessonId,
    ]);

  function getLessonStats(
    subjectId: string,
    lessonId: string
  ) {
    const workflow =
      getSubjectWorkflow(
        subjectId
      );

    const completed =
      lessonProgress[
        lessonId
      ] ?? [];

    const completedCount =
      workflow.filter(
        (step) =>
          completed.includes(
            step.id
          )
      ).length;

    const total =
      workflow.length;

    const progress =
      total === 0
        ? 0
        : Math.round(
            (completedCount /
              total) *
              100
          );

    return {
      total,
      completedCount,
      progress,
      complete:
        total > 0 &&
        completedCount ===
          total,
    };
  }

  function getSubjectStats(
    subjectId: string
  ) {
    const subject =
      curriculum.find(
        (item) =>
          item.id ===
          subjectId
      );

    if (!subject) {
      return {
        total: 0,
        completed: 0,
        progress: 0,
      };
    }

    const lessons =
      subject.units.flatMap(
        (unit) =>
          unit.lessons
      );

    const completed =
      lessons.filter(
        (lesson) =>
          getLessonStats(
            subject.id,
            lesson.id
          ).complete
      ).length;

    const total =
      lessons.length;

    const progress =
      total === 0
        ? 0
        : Math.round(
            (completed /
              total) *
              100
          );

    return {
      total,
      completed,
      progress,
    };
  }

  function getUnitStats(
    subjectId: string,
    lessonIds: string[]
  ) {
    const completed =
      lessonIds.filter(
        (lessonId) =>
          getLessonStats(
            subjectId,
            lessonId
          ).complete
      ).length;

    const total =
      lessonIds.length;

    const progress =
      total === 0
        ? 0
        : Math.round(
            (completed /
              total) *
              100
          );

    return {
      total,
      completed,
      progress,
    };
  }

  function toggleWorkflowStep(
    lessonId: string,
    stepId: string
  ) {
    setLessonProgress(
      (current) => {
        const currentSteps =
          current[
            lessonId
          ] ?? [];

        const nextSteps =
          currentSteps.includes(
            stepId
          )
            ? currentSteps.filter(
                (id) =>
                  id !==
                  stepId
              )
            : [
                ...currentSteps,
                stepId,
              ];

        return {
          ...current,
          [lessonId]:
            nextSteps,
        };
      }
    );
  }

  function openSubject(
    subjectId: string
  ) {
    const subject =
      curriculum.find(
        (item) =>
          item.id ===
          subjectId
      );

    setSelectedSubjectId(
      subjectId
    );

    setSelectedLessonId(
      null
    );

    setOpenUnitId(
      subject?.units[0]
        ?.id ?? null
    );
  }

  function startLessonTimer() {
    if (
      !selectedSubject ||
      !selectedLessonData
    ) {
      return;
    }

    setStudyContext({
      subjectId:
        selectedSubject.id,

      subjectName:
        selectedSubject.name,

      lessonId:
        selectedLessonData
          .lesson.id,

      lessonTitle:
        selectedLessonData
          .lesson.title,

      unitTitle:
        selectedLessonData
          .unit.title,

      goal:
        selectedLessonData
          .lesson.title,
    });
  }

  // ==========================================
  // Lesson
  // ==========================================

  if (
    selectedSubject &&
    selectedLessonData
  ) {
    const workflow =
      getSubjectWorkflow(
        selectedSubject.id
      );

    const stats =
      getLessonStats(
        selectedSubject.id,
        selectedLessonData
          .lesson.id
      );

    const completedSteps =
      lessonProgress[
        selectedLessonData
          .lesson.id
      ] ?? [];

    return (
      <div
        key={
          selectedLessonData
            .lesson.id
        }
        className="masar-enter"
      >
        <header className="mb-8">
          <button
            type="button"
            onClick={() =>
              setSelectedLessonId(
                null
              )
            }
            className="mb-6 rounded-full bg-white px-4 py-2 text-sm text-[#6E6E73] transition-all duration-200 hover:bg-[#ECECEF]"
          >
            ← رجوع للمادة
          </button>

          <p className="mb-2 text-sm text-[#86868B]">
            {
              selectedLessonData
                .unit.title
            }
          </p>

          <h1 className="max-w-4xl text-[32px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[44px]">
            {
              selectedLessonData
                .lesson.title
            }
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#86868B]">
            <span>
              {
                selectedSubject.name
              }
            </span>

            <span>·</span>

            <span>
              {
                selectedSubject.teacher
              }
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={
                startLessonTimer
              }
              className="rounded-full bg-[#0071E3] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.01] hover:bg-[#0077ED]"
            >
              ابدأ المذاكرة
            </button>

            <span className="text-xs text-[#86868B]">
              {stats.progress}% مكتمل
            </span>
          </div>

          <div className="mt-6 max-w-xl">
            <div className="h-[6px] overflow-hidden rounded-full bg-[#E8E8ED]">
              <div
                className="h-full rounded-full bg-[#0071E3] transition-all duration-500 ease-out"
                style={{
                  width: `${stats.progress}%`,
                }}
              />
            </div>
          </div>
        </header>

        {stats.complete && (
          <section className="masar-enter mb-5 rounded-[24px] bg-[#1D1D1F] p-5 text-white">
            <p className="text-sm font-medium">
              الدرس مكتمل ✓
            </p>

            <p className="mt-2 text-xs leading-5 text-[#A1A1A6]">
              خلصت كل خطوات
              المذاكرة الخاصة
              بالدرس.
            </p>
          </section>
        )}

        <section className="rounded-[28px] bg-white p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              خطوات الدرس
            </h2>

            <p className="mt-2 text-sm text-[#86868B]">
              علّم على الخطوة بعد
              ما تخلصها.
            </p>
          </div>

          <div className="space-y-2">
            {workflow.map(
              (step, index) => {
                const completed =
                  completedSteps.includes(
                    step.id
                  );

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() =>
                      toggleWorkflowStep(
                        selectedLessonData
                          .lesson.id,
                        step.id
                      )
                    }
                    className={`flex w-full items-start gap-4 rounded-[18px] border px-4 py-4 text-right transition-all duration-200 ${
                      completed
                        ? "border-transparent bg-[#F5F5F7]"
                        : "border-[#ECECEF] hover:border-[#D2D2D7] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition-all duration-200 ${
                        completed
                          ? "border-[#0071E3] bg-[#0071E3] text-white"
                          : "border-[#C7C7CC] text-[#86868B]"
                      }`}
                    >
                      {completed
                        ? "✓"
                        : index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          completed
                            ? "text-[#6E6E73]"
                            : "text-[#1D1D1F]"
                        }`}
                      >
                        {
                          step.title
                        }
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#86868B]">
                        {
                          step.description
                        }
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        <LessonWeakPoints
          subjectId={
            selectedSubject.id
          }
          subjectName={
            selectedSubject.name
          }
          lessonId={
            selectedLessonData
              .lesson.id
          }
          lessonTitle={
            selectedLessonData
              .lesson.title
          }
          unitTitle={
            selectedLessonData
              .unit.title
          }
        />

        {studyContext && (
          <LessonStudyTimer
            context={
              studyContext
            }
            onClose={() =>
              setStudyContext(
                null
              )
            }
          />
        )}
      </div>
    );
  }

  // ==========================================
  // Subject
  // ==========================================

  if (selectedSubject) {
    const stats =
      getSubjectStats(
        selectedSubject.id
      );

    return (
      <div
        key={selectedSubject.id}
        className="masar-enter"
      >
        <header className="mb-8">
          <button
            type="button"
            onClick={() => {
              setSelectedSubjectId(
                null
              );

              setSelectedLessonId(
                null
              );

              setOpenUnitId(
                null
              );
            }}
            className="mb-6 rounded-full bg-white px-4 py-2 text-sm text-[#6E6E73] transition-all duration-200 hover:bg-[#ECECEF]"
          >
            ← كل المواد
          </button>

          <p className="mb-2 text-sm text-[#86868B]">
            {
              selectedSubject.teacher
            }
          </p>

          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[46px]">
            {
              selectedSubject.name
            }
          </h1>

          <div className="mt-6 max-w-xl">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-[#86868B]">
                تقدم المنهج
              </span>

              <span className="font-medium">
                {stats.completed} من{" "}
                {stats.total}
              </span>
            </div>

            <div className="h-[6px] overflow-hidden rounded-full bg-[#E8E8ED]">
              <div
                className="h-full rounded-full bg-[#0071E3] transition-all duration-500 ease-out"
                style={{
                  width: `${stats.progress}%`,
                }}
              />
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {selectedSubject.units.map(
            (unit) => {
              const isOpen =
                openUnitId ===
                unit.id;

              const unitStats =
                getUnitStats(
                  selectedSubject.id,
                  unit.lessons.map(
                    (lesson) =>
                      lesson.id
                  )
                );

              return (
                <section
                  key={unit.id}
                  className="overflow-hidden rounded-[26px] bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={
                      isOpen
                    }
                    onClick={() =>
                      setOpenUnitId(
                        isOpen
                          ? null
                          : unit.id
                      )
                    }
                    className="flex w-full items-center justify-between gap-5 p-6 text-right transition-colors duration-200 hover:bg-[#FAFAFA]"
                  >
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold">
                        {
                          unit.title
                        }
                      </h2>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-[5px] max-w-[160px] flex-1 overflow-hidden rounded-full bg-[#E8E8ED]">
                          <div
                            className="h-full rounded-full bg-[#0071E3] transition-all duration-500 ease-out"
                            style={{
                              width: `${unitStats.progress}%`,
                            }}
                          />
                        </div>

                        <p className="shrink-0 text-xs text-[#86868B]">
                          {
                            unitStats.completed
                          }{" "}
                          من{" "}
                          {
                            unitStats.total
                          }
                        </p>
                      </div>
                    </div>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-lg transition-transform duration-300 ease-out ${
                        isOpen
                          ? "rotate-45"
                          : "rotate-0"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className="masar-expand"
                    data-open={
                      isOpen
                        ? "true"
                        : "false"
                    }
                  >
                    <div className="masar-expand-inner">
                      <div className="border-t border-[#ECECEF] p-4 sm:p-6">
                        <div className="space-y-2">
                          {unit.lessons.map(
                            (
                              lesson,
                              index
                            ) => {
                              const lessonStats =
                                getLessonStats(
                                  selectedSubject.id,
                                  lesson.id
                                );

                              return (
                                <button
                                  key={
                                    lesson.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    setSelectedLessonId(
                                      lesson.id
                                    )
                                  }
                                  className="group flex w-full items-center gap-4 rounded-[18px] border border-[#ECECEF] px-4 py-4 text-right transition-all duration-200 hover:-translate-y-[1px] hover:border-[#D2D2D7] hover:bg-[#FAFAFA]"
                                >
                                  <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs transition-all duration-200 ${
                                      lessonStats.complete
                                        ? "border-[#0071E3] bg-[#0071E3] text-white"
                                        : "border-[#C7C7CC] text-[#86868B]"
                                    }`}
                                  >
                                    {lessonStats.complete
                                      ? "✓"
                                      : index +
                                        1}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[#1D1D1F]">
                                      {
                                        lesson.title
                                      }
                                    </p>

                                    <div className="mt-2 flex items-center gap-3">
                                      <div className="h-[4px] max-w-[100px] flex-1 overflow-hidden rounded-full bg-[#E8E8ED]">
                                        <div
                                          className="h-full rounded-full bg-[#0071E3] transition-all duration-500 ease-out"
                                          style={{
                                            width: `${lessonStats.progress}%`,
                                          }}
                                        />
                                      </div>

                                      <p className="text-[11px] text-[#AEAEB2]">
                                        {
                                          lessonStats.progress
                                        }
                                        %
                                      </p>
                                    </div>
                                  </div>

                                  <span className="shrink-0 text-sm text-[#AEAEB2] transition-all duration-200 group-hover:-translate-x-1 group-hover:text-[#0071E3]">
                                    ←
                                  </span>
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            }
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // Subjects
  // ==========================================

  return (
    <div className="masar-enter">
      <header className="mb-8">
        <p className="mb-2 text-sm text-[#86868B]">
          المنهج
        </p>

        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[46px]">
          المواد
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6E6E73]">
          كل مادة، وحداتها
          ودروسها في مكان واحد.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {curriculum.map(
          (subject) => {
            const stats =
              getSubjectStats(
                subject.id
              );
            const lastSession = sessions
              .filter((session) => session.subjectId === subject.id)
              .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime())[0];

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() =>
                  openSubject(
                    subject.id
                  )
                }
                className="group rounded-[28px] bg-white p-6 text-right transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F5F5F7] text-lg font-semibold">
                    {subject.name.charAt(
                      0
                    )}
                  </div>

                  <span className="text-sm text-[#0071E3] opacity-0 transition-all duration-200 group-hover:-translate-x-1 group-hover:opacity-100">
                    فتح ←
                  </span>
                </div>

                <h2 className="mt-7 text-xl font-semibold">
                  {subject.name}
                </h2>

                <p className="mt-2 text-sm text-[#86868B]">
                  {
                    subject.teacher
                  }
                </p>

                <p className="mt-2 text-xs text-[#AEAEB2]">
                  آخر جلسة: {lastSession ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(lastSession.endedAt)) : "لا توجد جلسات"}
                </p>

                <div className="mt-7 flex flex-wrap gap-6 text-xs text-[#86868B]">
                  <span>
                    {
                      subject.units
                        .length
                    }{" "}
                    وحدات
                  </span>

                  <span>
                    {stats.total} درس
                  </span>
                </div>

                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between text-xs">
                    <span className="text-[#86868B]">
                      التقدم
                    </span>

                    <span className="font-medium">
                      {
                        stats.progress
                      }
                      %
                    </span>
                  </div>

                  <div className="h-[6px] overflow-hidden rounded-full bg-[#E8E8ED]">
                    <div
                      className="h-full rounded-full bg-[#0071E3] transition-all duration-500 ease-out"
                      style={{
                        width: `${stats.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#86868B]">
                  {stats.completed ===
                  0
                    ? "لم تبدأ بعد"
                    : `${stats.completed} من ${stats.total} درس مكتمل`}
                </p>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}