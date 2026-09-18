"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { subjects } from "@/data/studyData";

type Grade = {
  id: string;
  subject: string;
  type: "Quiz" | "Homework" | "Exam";
  score: number;
  total: number;
  date: string;
};

const inputClass =
  "mt-2 w-full rounded-[16px] border border-[#E5E5EA] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AEAEB2] focus:border-[#0071E3]";

export default function GradesView() {
  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [
    gradeSubject,
    setGradeSubject,
  ] = useState(
    subjects[0]?.name ?? ""
  );

  const [
    gradeType,
    setGradeType,
  ] =
    useState<Grade["type"]>(
      "Quiz"
    );

  const [
    gradeScore,
    setGradeScore,
  ] = useState("");

  const [
    gradeTotal,
    setGradeTotal,
  ] = useState("");

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "masar-grades"
      );

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setGrades(parsed);
        }
      } catch {
        setGrades([]);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      "masar-grades",
      JSON.stringify(grades)
    );
  }, [grades, loaded]);

  const average =
    useMemo(() => {
      if (
        grades.length === 0
      ) {
        return null;
      }

      const percentages =
        grades.map(
          (grade) =>
            (grade.score /
              grade.total) *
            100
        );

      return Math.round(
        percentages.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
          percentages.length
      );
    }, [grades]);

  function addGrade(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const score =
      Number(gradeScore);

    const total =
      Number(gradeTotal);

    if (
      gradeScore.trim() ===
        "" ||
      gradeTotal.trim() ===
        "" ||
      Number.isNaN(score) ||
      Number.isNaN(total) ||
      score < 0 ||
      total <= 0 ||
      score > total
    ) {
      return;
    }

    const grade: Grade = {
      id: crypto.randomUUID(),
      subject:
        gradeSubject,
      type: gradeType,
      score,
      total,
      date:
        new Date().toISOString(),
    };

    setGrades(
      (current) => [
        grade,
        ...current,
      ]
    );

    setGradeScore("");
    setGradeTotal("");
  }

  function deleteGrade(
    id: string
  ) {
    setGrades(
      (current) =>
        current.filter(
          (grade) =>
            grade.id !== id
        )
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm text-[#86868B]">
        جاري تحميل الدرجات...
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <form
        onSubmit={addGrade}
        className="rounded-[28px] bg-white p-6"
      >
        <div>
          <p className="text-xs text-[#86868B]">
            تقييم جديد
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            أضف درجتك
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#86868B]">
            سجل الدرجات الحقيقية
            فقط عشان التحليل يبقى
            دقيق.
          </p>
        </div>

        <div className="mt-7 space-y-5">
          <Field label="المادة">
            <select
              value={gradeSubject}
              onChange={(event) =>
                setGradeSubject(
                  event.target.value
                )
              }
              className={inputClass}
            >
              {subjects.map(
                (subject) => (
                  <option
                    key={
                      subject.name
                    }
                    value={
                      subject.name
                    }
                  >
                    {subject.name}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="نوع التقييم">
            <select
              value={gradeType}
              onChange={(event) =>
                setGradeType(
                  event.target
                    .value as Grade["type"]
                )
              }
              className={inputClass}
            >
              <option value="Quiz">
                Quiz
              </option>

              <option value="Homework">
                Homework
              </option>

              <option value="Exam">
                Exam
              </option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="درجتك">
              <input
                type="number"
                min="0"
                value={
                  gradeScore
                }
                onChange={(
                  event
                ) =>
                  setGradeScore(
                    event.target
                      .value
                  )
                }
                className={
                  inputClass
                }
                placeholder="0"
              />
            </Field>

            <Field label="الدرجة من">
              <input
                type="number"
                min="1"
                value={
                  gradeTotal
                }
                onChange={(
                  event
                ) =>
                  setGradeTotal(
                    event.target
                      .value
                  )
                }
                className={
                  inputClass
                }
                placeholder="20"
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          className="mt-7 w-full rounded-full bg-[#0071E3] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#0077ED]"
        >
          حفظ الدرجة
        </button>
      </form>

      <section className="rounded-[28px] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#86868B]">
              Results
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              درجاتي
            </h2>
          </div>

          {average !== null && (
            <div className="rounded-full bg-[#F5F5F7] px-4 py-2 text-sm">
              {average}%
            </div>
          )}
        </div>

        {grades.length === 0 ? (
          <div className="mt-6 rounded-[22px] bg-[#F5F5F7] px-5 py-12 text-center">
            <p className="text-sm font-medium">
              مفيش درجات لسه
            </p>

            <p className="mt-2 text-xs text-[#86868B]">
              أول ما تستلم تقييم
              ضيفه هنا.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {grades.map(
              (grade) => {
                const percentage =
                  Math.round(
                    (grade.score /
                      grade.total) *
                      100
                  );

                return (
                  <div
                    key={
                      grade.id
                    }
                    className="flex items-center justify-between gap-4 rounded-[20px] bg-[#F5F5F7] p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {
                          grade.subject
                        }
                      </p>

                      <p className="mt-1 text-xs text-[#86868B]">
                        {
                          grade.type
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-sm font-semibold">
                          {
                            grade.score
                          }
                          /
                          {
                            grade.total
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#86868B]">
                          {
                            percentage
                          }
                          %
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteGrade(
                            grade.id
                          )
                        }
                        className="rounded-full px-3 py-2 text-xs text-[#86868B] transition hover:bg-white hover:text-red-500"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-[#86868B]">
        {label}
      </span>

      {children}
    </label>
  );
}