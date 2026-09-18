export type StudyContext = {
  subjectId: string;
  subjectName: string;

  lessonId?: string;
  lessonTitle?: string;

  unitTitle?: string;

  goal?: string;
};

export type StudySession = {
  id: string;

  dateKey: string;

  subjectId: string;
  subjectName: string;

  lessonId?: string;
  lessonTitle?: string;

  unitTitle?: string;

  goal?: string;

  startedAt: string;
  endedAt: string;

  durationSeconds: number;
};

export const STUDY_SESSIONS_STORAGE_KEY =
  "masar-study-sessions";

export const CURRENT_STUDY_CONTEXT_STORAGE_KEY =
  "masar-current-study-context";

/**
 * Returns a local date key.
 * Example:
 * 2026-09-18
 */
export function getLocalDateKey(
  date: Date = new Date()
) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Load every saved study session.
 */
export function loadStudySessions(): StudySession[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(
    STUDY_SESSIONS_STORAGE_KEY
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
      (session): session is StudySession =>
        typeof session === "object" &&
        session !== null &&
        typeof session.id === "string" &&
        typeof session.subjectId === "string" &&
        typeof session.subjectName === "string" &&
        typeof session.startedAt === "string" &&
        typeof session.endedAt === "string" &&
        typeof session.durationSeconds === "number"
    );
  } catch {
    return [];
  }
}

/**
 * Save all sessions.
 */
export function saveStudySessions(
  sessions: StudySession[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STUDY_SESSIONS_STORAGE_KEY,
    JSON.stringify(sessions)
  );
}

/**
 * Create and save one real study session.
 */
export function addStudySession({
  context,
  startedAt,
  endedAt,
  durationSeconds,
}: {
  context: StudyContext;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
}) {
  if (
    typeof window === "undefined" ||
    durationSeconds <= 0
  ) {
    return null;
  }

  const session: StudySession = {
    id: crypto.randomUUID(),

    dateKey: getLocalDateKey(startedAt),

    subjectId: context.subjectId,
    subjectName: context.subjectName,

    lessonId: context.lessonId,
    lessonTitle: context.lessonTitle,

    unitTitle: context.unitTitle,

    goal: context.goal?.trim() || undefined,

    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),

    durationSeconds,
  };

  const sessions = loadStudySessions();

  const updatedSessions = [
    session,
    ...sessions,
  ];

  saveStudySessions(
    updatedSessions
  );

  return session;
}

/**
 * Save the lesson/subject the user wants
 * to study next.
 *
 * SubjectsView will use this before
 * opening the timer.
 */
export function saveStudyContext(
  context: StudyContext
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CURRENT_STUDY_CONTEXT_STORAGE_KEY,
    JSON.stringify(context)
  );
}

/**
 * Read the selected lesson/subject.
 */
export function loadStudyContext(): StudyContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = localStorage.getItem(
    CURRENT_STUDY_CONTEXT_STORAGE_KEY
  );

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.subjectId !== "string" ||
      typeof parsed.subjectName !== "string"
    ) {
      return null;
    }

    return parsed as StudyContext;
  } catch {
    return null;
  }
}

/**
 * Clear the selected study context.
 */
export function clearStudyContext() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    CURRENT_STUDY_CONTEXT_STORAGE_KEY
  );
}

/**
 * Total real focus time for one date.
 */
export function getFocusSecondsForDate(
  dateKey: string
) {
  return loadStudySessions()
    .filter(
      (session) =>
        session.dateKey === dateKey
    )
    .reduce(
      (total, session) =>
        total +
        session.durationSeconds,
      0
    );
}

/**
 * Total real focus time for one subject.
 */
export function getFocusSecondsForSubject(
  subjectId: string
) {
  return loadStudySessions()
    .filter(
      (session) =>
        session.subjectId ===
        subjectId
    )
    .reduce(
      (total, session) =>
        total +
        session.durationSeconds,
      0
    );
}

/**
 * Total real focus time for one lesson.
 */
export function getFocusSecondsForLesson(
  lessonId: string
) {
  return loadStudySessions()
    .filter(
      (session) =>
        session.lessonId === lessonId
    )
    .reduce(
      (total, session) =>
        total +
        session.durationSeconds,
      0
    );
}