"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  loadWeakPoints,
  resolveWeakPoint,
  sortWeakPointsByPriority,
  type WeakPoint,
  type WeakPointPriority,
} from "@/data/weakPointData";

const priorityLabel: Record<
  WeakPointPriority,
  string
> = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
};

export default function CatchUpReview() {
  const [
    weakPoints,
    setWeakPoints,
  ] = useState<WeakPoint[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const refresh =
    useCallback(() => {
      const openPoints =
        loadWeakPoints().filter(
          (point) =>
            !point.resolved
        );

      setWeakPoints(
        sortWeakPointsByPriority(
          openPoints
        )
      );
    }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, [refresh]);

  function completeReview(
    id: string
  ) {
    resolveWeakPoint(id);
    refresh();
  }

  if (!loaded) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-sm text-[#86868B]">
        جاري تجهيز مراجعتك...
      </section>
    );
  }

  return (
    <section className="rounded-[30px] bg-white p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#0071E3]">
            الخميس
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            مراجعة وتراكمات
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#86868B]">
            راجع الحاجات اللي
            سجلتها أثناء الأسبوع.
          </p>
        </div>

        <div className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm">
          {weakPoints.length} للمراجعة
        </div>
      </div>

      {weakPoints.length === 0 ? (
        <div className="mt-7 rounded-[22px] bg-[#F5F5F7] px-5 py-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm">
            ✓
          </div>

          <p className="mt-4 text-sm font-medium">
            مفيش تراكمات حاليًا
          </p>

          <p className="mt-2 text-xs text-[#86868B]">
            أي نقطة تسجلها داخل
            الدروس هتظهر هنا
            تلقائيًا.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {weakPoints.map(
            (point) => (
              <div
                key={point.id}
                className="rounded-[20px] border border-[#ECECEF] p-5 transition-all duration-200 hover:border-[#D2D2D7]"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          point.priority ===
                          "high"
                            ? "bg-[#0071E3]"
                            : point.priority ===
                                "medium"
                              ? "bg-[#1D1D1F]"
                              : "bg-[#A2AAAD]"
                        }`}
                      />

                      <span className="text-xs text-[#86868B]">
                        {
                          point.subjectName
                        }
                      </span>

                      <span className="text-[#D2D2D7]">
                        ·
                      </span>

                      <span className="text-xs text-[#86868B]">
                        أهمية{" "}
                        {
                          priorityLabel[
                            point.priority
                          ]
                        }
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium leading-6">
                      {point.note}
                    </p>

                    {point.lessonTitle && (
                      <p className="mt-2 text-xs text-[#86868B]">
                        {
                          point.lessonTitle
                        }
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      completeReview(
                        point.id
                      )
                    }
                    className="shrink-0 rounded-full bg-black px-5 py-3 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                  >
                    تمت المراجعة
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}