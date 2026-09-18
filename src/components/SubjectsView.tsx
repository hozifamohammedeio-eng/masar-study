"use client";

import { useEffect, useMemo, useState } from "react";

import { curriculum } from "@/data/curriculumData";
import { getSubjectWorkflow } from "@/data/workflowData";

const WORKFLOW_STORAGE_KEY =
  "masar-lesson-workflow-progress";

const OLD_COMPLETION_STORAGE_KEY =
  "masar-curriculum-completion";

type LessonProgress = Record<string, string[]>;

export default function SubjectsView() {
  const [selectedSubjectId, setSelectedSubjectId] =
    useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] =
    useState<string | null>(null);

  const [openUnitId, setOpenUnitId] =
    useState<string | null>(null);

  const [lessonProgress, setLessonProgress] =
    useState<LessonProgress>({});

  const [loaded, setLoaded] =
    useState(false);

  // --------------------------------------------------
  // Load saved progress
  // --------------------------------------------------
  useEffect(() => {
    let nextProgress: LessonProgress = {};

    const savedWorkflow =
      localStorage.getItem(
        WORKFLOW_STORAGE_KEY
      );

    if (savedWorkflow) {
      try {
        const parsed =
          JSON.parse(savedWorkflow);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          nextProgress =
            parsed as LessonProgress;
        }
      } catch {
        nextProgress = {};
      }
    }

    // Preserve progress from the old version
    const oldCompletion =
      localStorage.getItem(
        OLD_COMPLETION_STORAGE_KEY
      );

    let oldCompletedLessons: string[] = [];

    if (oldCompletion) {
      try {
        const parsed =
          JSON.parse(oldCompletion);

        if (Array.isArray(parsed)) {
          oldCompletedLessons = parsed;
        }
      } catch {
        oldCompletedLessons = [];
      }
    }

    // Convert any previously completed lesson
    // into completed workflow steps.
    curriculum.forEach((subject) => {
      const workflow =
        getSubjectWorkflow(subject.id);

      const workflowIds =
        workflow.map((step) => step.id);

      subject.units.forEach((unit) => {
        unit.lessons.forEach((lesson) => {
          if (
            oldCompletedLessons.includes(
              lesson.id
            ) &&
            !nextProgress[lesson.id]
          ) {
            nextProgress[lesson.id] =
              workflowIds;
          }
        });
      });
    });

    setLessonProgress(nextProgress);
    setLoaded(true);
  }, []);

  // --------------------------------------------------
  // Save workflow progress
  // --------------------------------------------------
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      WORKFLOW_STORAGE_KEY,
      JSON.stringify(lessonProgress)
    );

    // Keep old completion storage updated too
    const completedLessonIds: string[] =
      [];

    curriculum.forEach((subject) => {
      const workflow =
        getSubjectWorkflow(subject.id);

      const workflowIds =
        workflow.map((step) => step.id);

      subject.units.forEach((unit) => {
        unit.lessons.forEach((lesson) => {
          const completedSteps =
            lessonProgress[lesson.id] ?? [];

          const isComplete =
            workflowIds.length > 0 &&
            workflowIds.every((stepId) =>
              completedSteps.includes(stepId)
            );

          if (isComplete) {
            completedLessonIds.push(
              lesson.id
            );
          }
        });
      });
    });

    localStorage.setItem(
      OLD_COMPLETION_STORAGE_KEY,
      JSON.stringify(
        completedLessonIds
      )
    );
  }, [lessonProgress, loaded]);

  // --------------------------------------------------
  // Selected subject
  // --------------------------------------------------
  const selectedSubject =
    useMemo(() => {
      if (!selectedSubjectId) {
        return null;
      }

      return curriculum.find(
        (subject) =>
          subject.id ===
          selectedSubjectId
      );
    }, [selectedSubjectId]);

  // --------------------------------------------------
  // Selected lesson
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  function getLessonStats(
    subjectId: string,
    lessonId: string
  ) {
    const workflow =
      getSubjectWorkflow(subjectId);

    const completed =
      lessonProgress[lessonId] ?? [];

    const completedCount =
      workflow.filter((step) =>
        completed.includes(step.id)
      ).length;

    const total =
      workflow.length;

    const progress =
      total === 0
        ? 0
        : Math.round(
            (completedCount / total) *
              100
          );

    return {
      total,
      completedCount,
      progress,
      complete:
        total > 0 &&
        completedCount === total,
    };
  }

  function getSubjectStats(
    subjectId: string
  ) {
    const subject =
      curriculum.find(
        (item) =>
          item.id === subjectId
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
        (unit) => unit.lessons
      );

    const completed =
      lessons.filter((lesson) =>
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
            (completed / total) *
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
      lessonIds.filter((lessonId) =>
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
            (completed / total) *
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
          current[lessonId] ?? [];

        const nextSteps =
          currentSteps.includes(stepId)
            ? currentSteps.filter(
                (id) =>
                  id !== stepId
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
          item.id === subjectId
      );

    setSelectedSubjectId(
      subjectId
    );

    setSelectedLessonId(null);

    setOpenUnitId(
      subject?.units[0]?.id ??
        null
    );
  }

  function openLesson(
    lessonId: string
  ) {
    setSelectedLessonId(
      lessonId
    );
  }

  // ==================================================
  // LESSON VIEW
  // ==================================================
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
        selectedLessonData.lesson.id
      );

    const completedSteps =
      lessonProgress[
        selectedLessonData.lesson.id
      ] ?? [];

    return (
      <>
        <header className="mb-9">
          <button
            type="button"
            onClick={() =>
              setSelectedLessonId(
                null
              )
            }
            className="mb-6 rounded-full bg-white px-4 py-2 text-sm text-[#6E6E73] transition hover:bg-[#ECECEF]"
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
              {selectedSubject.name}
            </span>

            <span>·</span>

            <span>
              {
                selectedSubject.teacher
              }
            </span>
          </div>

          <div className="mt-7 max-w-xl">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-[#86868B]">
                تقدم الدرس
              </span>

              <span className="font-medium text-[#1D1D1F]">
                {
                  stats.completedCount
                }
                /{stats.total}
              </span>
            </div>

            <div className="h-[7px] overflow-hidden rounded-full bg-[#E8E8ED]">
              <div
                className="h-full rounded-full bg-[#0071E3] transition-all duration-500"
                style={{
                  width: `${stats.progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-[#86868B]">
              {stats.progress}% مكتمل
            </p>
          </div>
        </header>

        {stats.complete && (
          <section className="mb-5 rounded-[26px] bg-[#1D1D1F] p-6 text-white">
            <p className="text-xs text-[#A1A1A6]">
              Lesson complete
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              خلصت خطوات الدرس ✓
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#A1A1A6]">
              الدرس بيتحسب مكتمل
              لأنك أنهيت كل خطوات
              المذاكرة الخاصة بالمادة.
            </p>
          </section>
        )}

        <section className="rounded-[30px] bg-white p-5 sm:p-7">
          <div className="mb-7">
            <p className="text-xs font-medium text-[#0071E3]">
              Study Workflow
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              خطوات مذاكرة الدرس
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#86868B]">
              علّم على كل خطوة بعد
              ما تخلصها فعلًا.
            </p>
          </div>

          <div className="space-y-3">
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
                    className={`flex w-full gap-4 rounded-[22px] border p-5 text-right transition ${
                      completed
                        ? "border-transparent bg-[#F5F5F7]"
                        : "border-[#ECECEF] hover:border-[#D2D2D7]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition ${
                        completed
                          ? "border-[#0071E3] bg-[#0071E3] text-white"
                          : "border-[#C7C7CC] text-[#6E6E73]"
                      }`}
                    >
                      {completed
                        ? "✓"
                        : index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h3
                          className={`font-medium ${
                            completed
                              ? "text-[#6E6E73]"
                              : "text-[#1D1D1F]"
                          }`}
                        >
                          {
                            step.title
                          }
                        </h3>

                        <span className="shrink-0 text-[11px] text-[#AEAEB2]">
                          {completed
                            ? "مكتمل"
                            : "لم يكتمل"}
                        </span>
                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#86868B]">
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
      </>
    );
  }

  // ==================================================
  // SUBJECT DETAILS
  // ==================================================
  if (selectedSubject) {
    const stats =
      getSubjectStats(
        selectedSubject.id
      );

    return (
      <>
        <header className="mb-9">
          <button
            type="button"
            onClick={() => {
              setSelectedSubjectId(
                null
              );

              setSelectedLessonId(
                null
              );

              setOpenUnitId(null);
            }}
            className="mb-6 rounded-full bg-white px-4 py-2 text-sm text-[#6E6E73] transition hover:bg-[#ECECEF]"
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
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[#86868B]">
                تقدم المنهج
              </span>

              <span className="font-medium">
                {stats.completed} /{" "}
                {stats.total}
              </span>
            </div>

            <div className="h-[7px] overflow-hidden rounded-full bg-[#E8E8ED]">
              <div
                className="h-full rounded-full bg-[#0071E3] transition-all duration-500"
                style={{
                  width: `${stats.progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-[#86868B]">
              {stats.progress}% مكتمل
            </p>
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
                  className="overflow-hidden rounded-[28px] bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenUnitId(
                        isOpen
                          ? null
                          : unit.id
                      )
                    }
                    className="flex w-full items-center justify-between gap-5 p-6 text-right sm:p-7"
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
                            className="h-full rounded-full bg-[#0071E3] transition-all duration-500"
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
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-lg transition ${
                        isOpen
                          ? "rotate-45"
                          : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
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
                                  openLesson(
                                    lesson.id
                                  )
                                }
                                className="group flex w-full items-center gap-4 rounded-[18px] border border-[#ECECEF] px-4 py-4 text-right transition hover:border-[#D2D2D7] hover:bg-[#FAFAFA]"
                              >
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
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
                                        className="h-full rounded-full bg-[#0071E3]"
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

                                <span className="shrink-0 text-sm text-[#AEAEB2] transition group-hover:text-[#0071E3]">
                                  ←
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
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

  // ==================================================
  // SUBJECT LIST
  // ==================================================
  return (
    <>
      <header className="mb-9">
        <p className="mb-2 text-sm text-[#86868B]">
          المنهج
        </p>

        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[46px]">
          المواد
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6E6E73]">
          افتح أي مادة وتابع تقدمك
          الحقيقي في الوحدات
          والدروس.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {curriculum.map(
          (subject) => {
            const stats =
              getSubjectStats(
                subject.id
              );

            return (
              <button
                key={subject.id}
                type="button"
                onClick={() =>
                  openSubject(
                    subject.id
                  )
                }
                className="group rounded-[28px] bg-white p-6 text-right transition duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F5F5F7] text-lg font-semibold text-black">
                    {subject.name.charAt(
                      0
                    )}
                  </div>

                  <span className="text-sm text-[#0071E3] opacity-0 transition group-hover:opacity-100">
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

                    <span className="font-medium text-[#1D1D1F]">
                      {
                        stats.progress
                      }
                      %
                    </span>
                  </div>

                  <div className="h-[6px] overflow-hidden rounded-full bg-[#E8E8ED]">
                    <div
                      className="h-full rounded-full bg-[#0071E3] transition-all duration-500"
                      style={{
                        width: `${stats.progress}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#86868B]">
                  {stats.completed ===
                  0
                    ? "لم تبدأ هذه المادة بعد"
                    : `${stats.completed} من ${stats.total} درس مكتمل`}
                </p>
              </button>
            );
          }
        )}
      </div>
    </>
  );
}