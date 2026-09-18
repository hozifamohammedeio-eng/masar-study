"use client";

import { useMemo, useState } from "react";

import { loadCatchUpLessons, saveCatchUpLessons, type CatchUpLesson } from "@/data/taskData";

const defaultLessons: CatchUpLesson[] = [
  { id: "history-backlog-1", title: "محاضرة التاريخ الأولى", parts: ["مشاهدة الجزء الأول", "تلخيص الأفكار الأساسية", "حل أسئلة المحاضرة"].map((title, index) => ({ id: `history-1-${index}`, title, completed: false })) },
  { id: "history-backlog-2", title: "محاضرة التاريخ الثانية", parts: ["مشاهدة الجزء الأول", "تلخيص الأفكار الأساسية", "حل أسئلة المحاضرة"].map((title, index) => ({ id: `history-2-${index}`, title, completed: false })) },
];

export default function CatchUpManager() {
  const [lessons, setLessons] = useState<CatchUpLesson[]>(() => {
    const saved = loadCatchUpLessons();
    return saved.length ? saved : defaultLessons;
  });

  function togglePart(lessonId: string, partId: string) {
    const next = lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, parts: lesson.parts.map((part) => part.id === partId ? { ...part, completed: !part.completed } : part) } : lesson);
    setLessons(next);
    saveCatchUpLessons(next);
  }

  const progress = useMemo(() => {
    const parts = lessons.flatMap((lesson) => lesson.parts);
    return parts.length ? Math.round((parts.filter((part) => part.completed).length / parts.length) * 100) : 0;
  }, [lessons]);

  return (
    <section className="rounded-[28px] bg-white p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs text-[#86868B]">الخميس</p><h2 className="mt-2 text-2xl font-semibold">تراكم التاريخ</h2><p className="mt-2 text-sm text-[#86868B]">قسم كل محاضرة لخطوات صغيرة وأنهِها واحدة بعد الأخرى.</p></div>
        <span className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm">{progress}% مكتمل</span>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#E8E8ED]"><div className="h-full rounded-full bg-[#0071E3] transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => <article key={lesson.id} className="rounded-[22px] border border-[#ECECEF] p-4"><h3 className="font-medium">{lesson.title}</h3><div className="mt-3 space-y-2">{lesson.parts.map((part) => <button key={part.id} type="button" onClick={() => togglePart(lesson.id, part.id)} className={`flex w-full items-center gap-3 rounded-[16px] p-3 text-right text-sm ${part.completed ? "bg-[#F5F5F7] text-[#86868B] line-through" : "bg-[#FAFAFA]"}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${part.completed ? "border-[#0071E3] bg-[#0071E3] text-white" : "border-[#C7C7CC]"}`}>{part.completed ? "✓" : ""}</span>{part.title}</button>)}</div></article>)}
      </div>
    </section>
  );
}
