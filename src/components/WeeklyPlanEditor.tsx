"use client";

import { useState } from "react";

const STORAGE_KEY = "masar-weekly-schedule";

const defaultSchedule = [
  { day: "السبت", subjects: "عربي + تاريخ" },
  { day: "الأحد", subjects: "إنجليزي" },
  { day: "الاثنين", subjects: "برمجة" },
  { day: "الثلاثاء", subjects: "تاريخ" },
  { day: "الأربعاء", subjects: "برمجة" },
  { day: "الخميس", subjects: "مراجعة أو تعويض" },
  { day: "الجمعة", subjects: "إجازة" },
];

export default function WeeklyPlanEditor() {
  const [schedule, setSchedule] = useState(() => {
    if (typeof window === "undefined") return defaultSchedule;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      return Array.isArray(saved) && saved.length === defaultSchedule.length ? saved : defaultSchedule;
    } catch {
      return defaultSchedule;
    }
  });
  const [editingDay, setEditingDay] = useState<string | null>(null);

  function updateSubjects(day: string, subjects: string) {
    const next = schedule.map((item) => item.day === day ? { ...item, subjects } : item);
    setSchedule(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEditingDay(null);
  }

  return (
    <section className="rounded-[28px] bg-white p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-xs text-[#86868B]">تنظيم ثابت</p>
        <h2 className="mt-2 text-2xl font-semibold">الجدول الأسبوعي</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {schedule.map((item) => (
          <div key={item.day} className="rounded-[20px] border border-[#ECECEF] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{item.day}</p>
              <button type="button" onClick={() => setEditingDay(item.day)} className="rounded-full bg-[#F5F5F7] px-3 py-2 text-xs">تعديل</button>
            </div>
            {editingDay === item.day ? (
              <form className="mt-4" onSubmit={(event) => { event.preventDefault(); updateSubjects(item.day, new FormData(event.currentTarget).get("subjects")?.toString() ?? item.subjects); }}>
                <input name="subjects" defaultValue={item.subjects} className="task-input" autoFocus />
                <div className="mt-3 flex gap-2">
                  <button type="submit" className="rounded-full bg-black px-4 py-2 text-xs text-white">حفظ</button>
                  <button type="button" onClick={() => setEditingDay(null)} className="rounded-full bg-[#F5F5F7] px-4 py-2 text-xs">إلغاء</button>
                </div>
              </form>
            ) : <p className="mt-4 text-sm text-[#6E6E73]">{item.subjects}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
