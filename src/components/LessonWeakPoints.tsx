"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  addWeakPoint,
  deleteWeakPoint,
  getWeakPointsForLesson,
  reopenWeakPoint,
  resolveWeakPoint,
  sortWeakPointsByPriority,
  type WeakPoint,
  type WeakPointPriority,
} from "@/data/weakPointData";

type Props = {
  subjectId: string;
  subjectName: string;

  lessonId: string;
  lessonTitle: string;

  unitTitle?: string;
};

const priorityLabels: Record<
  WeakPointPriority,
  string
> = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
};

export default function LessonWeakPoints({
  subjectId,
  subjectName,
  lessonId,
  lessonTitle,
  unitTitle,
}: Props) {
  const [
    weakPoints,
    setWeakPoints,
  ] = useState<WeakPoint[]>([]);

  const [note, setNote] =
    useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<WeakPointPriority>(
      "medium"
    );

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const refreshWeakPoints =
    useCallback(() => {
      const points =
        getWeakPointsForLesson(
          lessonId
        );

      setWeakPoints(
        sortWeakPointsByPriority(
          points
        )
      );
    }, [lessonId]);

  useEffect(() => {
    refreshWeakPoints();
    setLoaded(true);
  }, [refreshWeakPoints]);

  function handleAdd() {
    const trimmed =
      note.trim();

    if (!trimmed) {
      return;
    }

    addWeakPoint({
      subjectId,
      subjectName,

      lessonId,
      lessonTitle,

      unitTitle,

      note: trimmed,
      priority,
    });

    setNote("");
    setPriority("medium");

    refreshWeakPoints();
  }

  function handleResolve(
    id: string
  ) {
    resolveWeakPoint(id);
    refreshWeakPoints();
  }

  function handleReopen(
    id: string
  ) {
    reopenWeakPoint(id);
    refreshWeakPoints();
  }

  function handleDelete(
    id: string
  ) {
    deleteWeakPoint(id);
    refreshWeakPoints();
  }

  const openPoints =
    weakPoints.filter(
      (point) =>
        !point.resolved
    );

  const resolvedPoints =
    weakPoints.filter(
      (point) =>
        point.resolved
    );

  if (!loaded) {
    return (
      <section className="mt-5 rounded-[30px] bg-white p-6 text-sm text-[#86868B]">
        جاري تحميل نقاط المراجعة...
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-[30px] bg-white p-5 sm:p-7">
      <div>
        <p className="text-xs font-medium text-[#0071E3]">
          Weak Points
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          نقاط محتاجة مراجعة
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#86868B]">
          سجل أي نقطة لسه مش
          واضحة أو محتاجة ترجع
          لها بعدين.
        </p>
      </div>

      {/* Add weak point */}
      <div className="mt-7 rounded-[24px] bg-[#F5F5F7] p-5">
        <label className="text-xs text-[#86868B]">
          إيه اللي محتاج تراجعه؟
        </label>

        <textarea
          value={note}
          onChange={(event) =>
            setNote(
              event.target.value
            )
          }
          placeholder="مثال: بلخبط بين أسباب الحدث ونتائجه."
          rows={3}
          className="mt-2 w-full resize-none rounded-[18px] border border-[#E5E5EA] bg-white px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[#AEAEB2] focus:border-[#0071E3]"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-[#86868B]">
              الأهمية
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  "low",
                  "medium",
                  "high",
                ] as WeakPointPriority[]
              ).map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setPriority(
                        level
                      )
                    }
                    className={`rounded-full px-4 py-2 text-xs transition ${
                      priority ===
                      level
                        ? "bg-black text-white"
                        : "bg-white text-[#6E6E73]"
                    }`}
                  >
                    {
                      priorityLabels[
                        level
                      ]
                    }
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={
              note.trim() === ""
            }
            className="rounded-full bg-[#0071E3] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0077ED] disabled:cursor-not-allowed disabled:opacity-40"
          >
            إضافة للمراجعة
          </button>
        </div>
      </div>

      {/* Open weak points */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold">
            محتاجة مراجعة
          </h3>

          <span className="rounded-full bg-[#F5F5F7] px-3 py-1.5 text-xs text-[#6E6E73]">
            {openPoints.length}
          </span>
        </div>

        {openPoints.length ===
        0 ? (
          <div className="mt-4 rounded-[20px] border border-dashed border-[#D2D2D7] px-5 py-8 text-center">
            <p className="text-sm text-[#86868B]">
              مفيش نقاط ضعف مسجلة
              في الدرس ده.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {openPoints.map(
              (point) => (
                <WeakPointCard
                  key={point.id}
                  point={point}
                  onResolve={() =>
                    handleResolve(
                      point.id
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      point.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Resolved */}
      {resolvedPoints.length >
        0 && (
        <div className="mt-8 border-t border-[#ECECEF] pt-7">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-[#86868B]">
              تمت مراجعتها
            </h3>

            <span className="text-xs text-[#86868B]">
              {
                resolvedPoints.length
              }
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {resolvedPoints.map(
              (point) => (
                <div
                  key={point.id}
                  className="rounded-[20px] bg-[#F5F5F7] p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#34C759] text-xs text-white">
                      ✓
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 text-[#86868B] line-through">
                        {point.note}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleReopen(
                              point.id
                            )
                          }
                          className="rounded-full bg-white px-3 py-2 text-xs text-[#6E6E73] transition hover:text-black"
                        >
                          محتاجة مراجعة تاني
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              point.id
                            )
                          }
                          className="rounded-full px-3 py-2 text-xs text-[#86868B] transition hover:text-red-500"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function WeakPointCard({
  point,
  onResolve,
  onDelete,
}: {
  point: WeakPoint;
  onResolve: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-[#ECECEF] p-5">
      <div className="flex items-start gap-4">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            point.priority ===
            "high"
              ? "bg-[#0071E3]"
              : point.priority ===
                  "medium"
                ? "bg-[#1D1D1F]"
                : "bg-[#A2AAAD]"
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-sm leading-6 text-[#1D1D1F]">
              {point.note}
            </p>

            <span className="shrink-0 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] text-[#6E6E73]">
              أهمية{" "}
              {
                priorityLabels[
                  point.priority
                ]
              }
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onResolve}
              className="rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#2C2C2E]"
            >
              تمت المراجعة
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="rounded-full bg-[#F5F5F7] px-4 py-2.5 text-xs text-[#86868B] transition hover:text-red-500"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}