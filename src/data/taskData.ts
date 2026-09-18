export type TaskStatus = "not-started" | "in-progress" | "completed";

export type StudyTask = {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  dueDate: string;
  estimatedMinutes: number;
  status: TaskStatus;
  createdAt: string;
};

export type CatchUpPart = {
  id: string;
  title: string;
  completed: boolean;
};

export type CatchUpLesson = {
  id: string;
  title: string;
  parts: CatchUpPart[];
};

export const TASKS_STORAGE_KEY = "masar-tasks";
export const CATCH_UP_STORAGE_KEY = "masar-catch-up";

export function loadTasks(): StudyTask[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: StudyTask[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }
}

export function loadCatchUpLessons(): CatchUpLesson[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(CATCH_UP_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCatchUpLessons(lessons: CatchUpLesson[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CATCH_UP_STORAGE_KEY, JSON.stringify(lessons));
  }
}

export function isTaskOverdue(task: StudyTask, todayKey: string) {
  return task.status !== "completed" && task.dueDate < todayKey;
}
