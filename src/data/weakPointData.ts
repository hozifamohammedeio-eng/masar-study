export type WeakPointPriority =
  | "low"
  | "medium"
  | "high";

export type WeakPoint = {
  id: string;

  subjectId: string;
  subjectName: string;

  lessonId?: string;
  lessonTitle?: string;

  unitTitle?: string;

  note: string;

  priority: WeakPointPriority;

  createdAt: string;

  resolved: boolean;
  resolvedAt?: string;
};

export type CreateWeakPointInput = {
  subjectId: string;
  subjectName: string;

  lessonId?: string;
  lessonTitle?: string;

  unitTitle?: string;

  note: string;

  priority: WeakPointPriority;
};

export const WEAK_POINTS_STORAGE_KEY =
  "masar-weak-points";

/**
 * تحميل كل نقاط الضعف المحفوظة.
 */
export function loadWeakPoints(): WeakPoint[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(
    WEAK_POINTS_STORAGE_KEY
  );

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is WeakPoint =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.subjectId === "string" &&
        typeof item.subjectName === "string" &&
        typeof item.note === "string" &&
        typeof item.createdAt === "string" &&
        typeof item.resolved === "boolean" &&
        (
          item.priority === "low" ||
          item.priority === "medium" ||
          item.priority === "high"
        )
    );
  } catch {
    return [];
  }
}

/**
 * حفظ القائمة كاملة.
 */
export function saveWeakPoints(
  weakPoints: WeakPoint[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    WEAK_POINTS_STORAGE_KEY,
    JSON.stringify(weakPoints)
  );
}

/**
 * إضافة نقطة ضعف جديدة.
 */
export function addWeakPoint(
  input: CreateWeakPointInput
) {
  if (typeof window === "undefined") {
    return null;
  }

  const note = input.note.trim();

  if (!note) {
    return null;
  }

  const weakPoint: WeakPoint = {
    id: crypto.randomUUID(),

    subjectId: input.subjectId,
    subjectName: input.subjectName,

    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,

    unitTitle: input.unitTitle,

    note,

    priority: input.priority,

    createdAt: new Date().toISOString(),

    resolved: false,
  };

  const current =
    loadWeakPoints();

  const updated = [
    weakPoint,
    ...current,
  ];

  saveWeakPoints(updated);

  return weakPoint;
}

/**
 * تعديل نص أو أولوية نقطة ضعف.
 */
export function updateWeakPoint(
  id: string,
  updates: Partial<
    Pick<
      WeakPoint,
      "note" | "priority"
    >
  >
) {
  if (typeof window === "undefined") {
    return;
  }

  const current =
    loadWeakPoints();

  const updated =
    current.map(
      (weakPoint) => {
        if (
          weakPoint.id !== id
        ) {
          return weakPoint;
        }

        return {
          ...weakPoint,

          ...(typeof updates.note ===
          "string"
            ? {
                note:
                  updates.note.trim(),
              }
            : {}),

          ...(updates.priority
            ? {
                priority:
                  updates.priority,
              }
            : {}),
        };
      }
    );

  saveWeakPoints(updated);
}

/**
 * تعليم نقطة الضعف كمحلولة.
 */
export function resolveWeakPoint(
  id: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const current =
    loadWeakPoints();

  const updated =
    current.map(
      (weakPoint) =>
        weakPoint.id === id
          ? {
              ...weakPoint,
              resolved: true,
              resolvedAt:
                new Date().toISOString(),
            }
          : weakPoint
    );

  saveWeakPoints(updated);
}

/**
 * إعادة نقطة ضعف للمراجعة.
 */
export function reopenWeakPoint(
  id: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const current =
    loadWeakPoints();

  const updated =
    current.map(
      (weakPoint) => {
        if (
          weakPoint.id !== id
        ) {
          return weakPoint;
        }

        const {
          resolvedAt:
            _resolvedAt,
          ...rest
        } = weakPoint;

        return {
          ...rest,
          resolved: false,
        };
      }
    );

  saveWeakPoints(updated);
}

/**
 * حذف نقطة ضعف نهائيًا.
 */
export function deleteWeakPoint(
  id: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const current =
    loadWeakPoints();

  const updated =
    current.filter(
      (weakPoint) =>
        weakPoint.id !== id
    );

  saveWeakPoints(updated);
}

/**
 * نقاط الضعف التي ما زالت محتاجة مراجعة.
 */
export function getOpenWeakPoints() {
  return loadWeakPoints().filter(
    (weakPoint) =>
      !weakPoint.resolved
  );
}

/**
 * نقاط الضعف الخاصة بمادة معينة.
 */
export function getWeakPointsForSubject(
  subjectId: string
) {
  return loadWeakPoints().filter(
    (weakPoint) =>
      weakPoint.subjectId ===
      subjectId
  );
}

/**
 * نقاط الضعف الخاصة بدرس معين.
 */
export function getWeakPointsForLesson(
  lessonId: string
) {
  return loadWeakPoints().filter(
    (weakPoint) =>
      weakPoint.lessonId ===
      lessonId
  );
}

/**
 * ترتيب التراكمات:
 * High ثم Medium ثم Low.
 */
export function sortWeakPointsByPriority(
  weakPoints: WeakPoint[]
) {
  const priorityWeight: Record<
    WeakPointPriority,
    number
  > = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...weakPoints].sort(
    (a, b) => {
      const priorityDifference =
        priorityWeight[
          b.priority
        ] -
        priorityWeight[
          a.priority
        ];

      if (
        priorityDifference !== 0
      ) {
        return priorityDifference;
      }

      return (
        new Date(
          a.createdAt
        ).getTime() -
        new Date(
          b.createdAt
        ).getTime()
      );
    }
  );
}