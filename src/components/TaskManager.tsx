"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import { curriculum } from "@/data/curriculumData";
import type { StudyTask, TaskStatus } from "@/data/taskData";
import { isTaskOverdue } from "@/data/taskData";

type TaskManagerProps = {
  tasks: StudyTask[];
  todayKey: string;
  onChange: (tasks: StudyTask[]) => void;
};

const emptyForm = {
  title: "",
  subjectId: curriculum[0]?.id ?? "",
  dueDate: "",
  estimatedMinutes: "30",
};

const statusLabels: Record<TaskStatus, string> = {
  "not-started": "لم تبدأ",
  "in-progress": "قيد التنفيذ",
  completed: "مكتملة",
};

export default function TaskManager({ tasks, todayKey, onChange }: TaskManagerProps) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  );

  function resetForm() {
    setForm({ ...emptyForm, dueDate: todayKey });
    setEditingId(null);
    setShowForm(false);
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = curriculum.find((item) => item.id === form.subjectId);
    if (!form.title.trim() || !subject || !form.dueDate) return;

    const task: StudyTask = {
      id: editingId ?? crypto.randomUUID(),
      title: form.title.trim(),
      subjectId: subject.id,
      subjectName: subject.name,
      dueDate: form.dueDate,
      estimatedMinutes: Math.max(5, Number(form.estimatedMinutes) || 30),
      status: editingId
        ? tasks.find((item) => item.id === editingId)?.status ?? "not-started"
        : "not-started",
      createdAt: editingId
        ? tasks.find((item) => item.id === editingId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    };

    onChange(editingId ? tasks.map((item) => (item.id === editingId ? task : item)) : [task, ...tasks]);
    resetForm();
  }

  function editTask(task: StudyTask) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      subjectId: task.subjectId,
      dueDate: task.dueDate,
      estimatedMinutes: String(task.estimatedMinutes),
    });
    setShowForm(true);
  }

  function updateStatus(id: string, status: TaskStatus) {
    onChange(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  return (
    <section className="rounded-[28px] bg-white p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs text-[#86868B]">قائمة العمل</p>
          <h2 className="mt-2 text-2xl font-semibold">المهام</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ ...emptyForm, dueDate: todayKey });
            setEditingId(null);
            setShowForm(true);
          }}
          className="rounded-full bg-[#0071E3] px-5 py-3 text-sm font-medium text-white"
        >
          + إضافة مهمة
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveTask} className="mt-6 grid gap-4 rounded-[22px] bg-[#F5F5F7] p-4 sm:grid-cols-2">
          <Field label="المهمة">
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="task-input" placeholder="مثال: حل تدريبات المحاضرة" />
          </Field>
          <Field label="المادة">
            <select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="task-input">
              {curriculum.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </Field>
          <Field label="التاريخ">
            <input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="task-input" />
          </Field>
          <Field label="المدة التقريبية بالدقائق">
            <input required min="5" type="number" value={form.estimatedMinutes} onChange={(event) => setForm({ ...form, estimatedMinutes: event.target.value })} className="task-input" />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="rounded-full bg-black px-5 py-3 text-sm text-white">{editingId ? "حفظ التعديل" : "حفظ المهمة"}</button>
            <button type="button" onClick={resetForm} className="rounded-full bg-white px-5 py-3 text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="rounded-[20px] bg-[#F5F5F7] px-5 py-9 text-center text-sm text-[#86868B]">لا توجد مهام بعد. أضف أول مهمة لمذاكرتك.</div>
        ) : sortedTasks.map((task) => {
          const overdue = isTaskOverdue(task, todayKey);
          return (
            <article key={task.id} className={`rounded-[20px] border p-4 ${overdue ? "border-[#FF3B30] bg-[#FFF8F7]" : "border-[#ECECEF]"}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-medium ${task.status === "completed" ? "text-[#86868B] line-through" : ""}`}>{task.title}</h3>
                    {overdue && <span className="rounded-full bg-[#FF3B30] px-2.5 py-1 text-[11px] text-white">متأخرة</span>}
                  </div>
                  <p className="mt-2 text-xs text-[#86868B]">{task.subjectName} · {task.dueDate} · {task.estimatedMinutes} دقيقة</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select aria-label={`حالة ${task.title}`} value={task.status} onChange={(event) => updateStatus(task.id, event.target.value as TaskStatus)} className="rounded-full bg-[#F5F5F7] px-3 py-2 text-xs">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button type="button" onClick={() => editTask(task)} className="rounded-full bg-[#F5F5F7] px-3 py-2 text-xs">تعديل</button>
                  <button type="button" onClick={() => onChange(tasks.filter((item) => item.id !== task.id))} className="rounded-full bg-[#FFF0EF] px-3 py-2 text-xs text-[#D70015]">حذف</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="text-xs text-[#86868B]">{label}</span>{children}</label>;
}
