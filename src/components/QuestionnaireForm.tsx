"use client";

import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { QUESTIONS } from "@/lib/constants";
import { saveSkinProfile } from "@/actions/questionnaire";
import { getSupabaseClient } from "@/lib/supabaseClient";

type Question = (typeof QUESTIONS)[number];

type Props = {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
};

type FormState = { error?: string } | null;

export default function QuestionnaireForm({ user }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const meta = user?.user_metadata as any;
    const skin = meta?.skin_profile as { answers?: Record<string, string> } | undefined;
    return skin?.answers || {};
  });
  const [current, setCurrent] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, startTransition] = useTransition();
  const [state, formAction] = useActionState<FormState, FormData>(async (prevState, formData) => {
    const res = await saveSkinProfile(prevState, formData);
    return res ?? null;
  }, null);
  const [aiSummary, setAiSummary] = useState("");
  const [localError, setLocalError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const isLast = current === QUESTIONS.length - 1;
  const currentQuestion: Question = QUESTIONS[current];
  const currentAnswer = answers[currentQuestion.key] ?? "";
  const canProceed = useMemo(() => !!currentAnswer, [currentAnswer]);
  const allAnswered = useMemo(() => QUESTIONS.every((q) => (answers[q.key] || "").trim().length > 0), [answers]);

  function updateAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (!canProceed) return;
    setCurrent((c) => Math.min(c + 1, QUESTIONS.length - 1));
  }
  function prev() {
    setCurrent((c) => Math.max(c - 1, 0));
  }

  async function fetchAiSummary() {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error("Sesi login berakhir/hilang. Silakan refresh atau login ulang.");
    }

    const messages = [
      {
        role: "user",
        content: QUESTIONS.map((q, index) => {
          const answerText = answers[q.key] ?? "";
          // Cari index jawaban di dalam array options untuk mendapatkan nomor opsinya (1-4)
          const optionIndex = (q.options as readonly string[]).indexOf(answerText) + 1;

          return `Q${index + 1}. ${q.label}\nSelected: Opt ${optionIndex} (${answerText})`;
        }).join("\n\n"),
      },
    ];
    const res = await fetch("/api/skin-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ mode: "analysis", messages }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Gagal meminta ringkasan");
    return String(json?.content ?? "").trim();
  }

  async function submitAll() {
    if (!allAnswered || aiLoading || isSubmitting) return;
    setLocalError("");
    try {
      setAiLoading(true);
      const summary = aiSummary || (await fetchAiSummary());
      setAiSummary(summary);

      // Clean up potential noise from AI response
      const cleanSummary = summary
        .replace(/^(Medical Report|Analysis|Result|Detected Conditions):/i, "")
        .replace(/\r\n/g, ",")
        .replace(/\n/g, ",");

      const tags = cleanSummary
        .split(",")
        .map((tag) => tag.trim().replace(/^[-*•]\s*/, "")) // Remove bullet points if any
        .filter((tag) => tag.length > 2); // Filter out very short/empty tags

      // Update user di Client Side (ini kunci agar browser cookie mendapatkan session JWT baru)
      const supabase = getSupabaseClient();
      const { error: updateErr } = await supabase.auth.updateUser({
        data: {
          skin_profile: { answers, summary: cleanSummary, updated_at: new Date().toISOString() },
          skin_tags: tags,
          skinshort: cleanSummary,
        }
      });

      if (updateErr) throw new Error(updateErr.message);

      const form = formRef.current;
      if (!form) return;
      const formData = new FormData(form);
      formData.set("answers", JSON.stringify(answers));
      formData.set("aiSummary", summary);
      startTransition(() => {
        formAction(formData);
      });
    } catch (err: any) {
      setLocalError(err?.message || "Terjadi kesalahan");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-light">Question {current + 1} / {QUESTIONS.length}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark">Questioner Kulit</h1>
          <p className="mt-2 text-sm text-brand-light">Jawab beberapa pertanyaan supaya kami bisa memberi ringkasan dan saran.</p>
        </div>
        <Card className="p-6">
          <form ref={formRef} className="space-y-4" action={formAction}>
            <input type="hidden" name="answers" value={JSON.stringify(answers)} readOnly />
            <input type="hidden" name="aiSummary" value={aiSummary} readOnly />
            <div className="space-y-2">
              <div className="text-lg font-semibold text-brand-dark">{currentQuestion.label}</div>
              <div className="grid gap-3">
                {currentQuestion.options.map((opt) => {
                  const checked = currentAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateAnswer(currentQuestion.key, opt)}
                      className={
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition " +
                        (checked
                          ? "border-brand-primary bg-brand-secondary/70 text-brand-dark ring-2 ring-brand-primary/60"
                          : "border-neutral-200 bg-white text-brand-dark hover:border-brand-primary/50")
                      }
                    >
                      <span>{opt}</span>
                      <span className={"h-4 w-4 rounded-full border " + (checked ? "border-brand-primary bg-brand-primary" : "border-neutral-300")} />
                    </button>
                  );
                })}
              </div>
            </div>

            {localError ? <div className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-200">{localError}</div> : null}
            {state?.error ? <div className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-200">{state.error}</div> : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button type="button" variant="ghost" disabled={current === 0 || aiLoading || isSubmitting} onClick={prev}>
                Sebelumnya
              </Button>
              {!isLast ? (
                <Button type="button" disabled={!canProceed || aiLoading || isSubmitting} onClick={next}>
                  {aiLoading ? "Memproses…" : "Berikutnya"}
                </Button>
              ) : (
                <Button type="button" disabled={!allAnswered || aiLoading || isSubmitting} onClick={submitAll} className="min-w-[160px]">
                  {aiLoading || isSubmitting ? "Menyimpan…" : "Simpan & ringkas"}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
