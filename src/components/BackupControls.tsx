"use client";

import { useRef, useState } from "react";

export default function BackupControls() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function exportBackup() {
    const data: Record<string, string> = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key) data[key] = localStorage.getItem(key) ?? "";
    }
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `masar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("تم تصدير النسخة الاحتياطية");
  }

  async function importBackup(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed?.data || typeof parsed.data !== "object" || Array.isArray(parsed.data)) throw new Error("invalid");
      Object.entries(parsed.data as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value === "string") localStorage.setItem(key, value);
      });
      setMessage("تم الاستيراد، سيتم تحديث البيانات");
      window.setTimeout(() => window.location.reload(), 500);
    } catch {
      setMessage("ملف النسخة الاحتياطية غير صالح");
    }
  }

  return (
    <div className="mt-8 border-t border-[#ECECEF] pt-6">
      <p className="text-sm font-medium">بياناتك</p>
      <p className="mt-2 text-xs leading-6 text-[#86868B]">احتفظ بنسخة من بياناتك أو استعدها على هذا الجهاز.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={exportBackup} className="rounded-full bg-black px-5 py-3 text-sm text-white">تصدير JSON</button>
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-[#F5F5F7] px-5 py-3 text-sm">استيراد JSON</button>
        <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importBackup(file); event.target.value = ""; }} />
      </div>
      {message && <p className="mt-3 text-xs text-[#0071E3]">{message}</p>}
    </div>
  );
}
