"use client";

import { useState } from "react";

import AnalyticsView from "@/components/AnalyticsView";
import GradesView from "@/components/GradesView";

type ProgressTab =
  | "overview"
  | "grades";

export default function ProgressView() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ProgressTab>(
      "overview"
    );

  return (
    <>
      <header className="mb-8">
        <p className="mb-2 text-sm text-[#86868B]">
          Progress
        </p>

        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.04em] text-black sm:text-[46px]">
          تقدمي
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6E6E73]">
          تابع وقت مذاكرتك
          ودرجاتك من مكان واحد.
        </p>
      </header>

      <div className="mb-7 inline-flex rounded-full bg-white p-1.5">
        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "overview"
            )
          }
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            activeTab ===
            "overview"
              ? "bg-black text-white"
              : "text-[#6E6E73] hover:text-black"
          }`}
        >
          نظرة عامة
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "grades"
            )
          }
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
            activeTab ===
            "grades"
              ? "bg-black text-white"
              : "text-[#6E6E73] hover:text-black"
          }`}
        >
          الدرجات
        </button>
      </div>

      {activeTab ===
      "overview" ? (
        <AnalyticsView />
      ) : (
        <GradesView />
      )}
    </>
  );
}