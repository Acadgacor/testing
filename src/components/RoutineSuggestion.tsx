"use client";
import { useState } from "react";
import Image from "next/image";
import Card from "@/shared/ui/Card";
import type { Routine } from "@/features/questionnaire/lib/routineGenerator";

type Props = {
    routine: Routine;
};

export default function RoutineSuggestion({ routine }: Props) {
    const [tab, setTab] = useState<"morning" | "night">("morning");

    const steps = tab === "morning" ? routine.morning : routine.night;

    if (steps.length === 0) return null;

    return (
        <Card className="mt-8 overflow-hidden">
            <div className="border-b border-neutral-200">
                <div className="flex">
                    <button
                        onClick={() => setTab("morning")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === "morning"
                            ? "border-b-2 border-brand-primary bg-brand-secondary/30 text-brand-dark"
                            : "text-brand-light hover:text-brand-dark"
                            }`}
                    >
                        Routine Pagi ☀️
                    </button>
                    <button
                        onClick={() => setTab("night")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === "night"
                            ? "border-b-2 border-brand-primary bg-brand-secondary/30 text-brand-dark"
                            : "text-brand-light hover:text-brand-dark"
                            }`}
                    >
                        Routine Malam 🌙
                    </button>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Rekomendasi Cara Pakai</h3>
                <div className="space-y-4">
                    {steps.map((step, idx) => (
                        <div key={`${step.product.id}-${idx}`} className="flex items-center gap-4 relative">
                            <div className="flex-none flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary ring-1 ring-brand-primary/20">
                                {idx + 1}
                            </div>
                            <div className="flex-none h-12 w-12 rounded-lg bg-neutral-100 relative overflow-hidden">
                                {step.product.image ? (
                                    <Image src={step.product.image} alt={step.product.name} fill className="object-cover" />
                                ) : null}
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-brand-light">{step.label}</div>
                                <div className="text-sm font-medium text-brand-dark">{step.product.name}</div>
                            </div>
                            {/* Connector Line */}
                            {idx !== steps.length - 1 && (
                                <div className="absolute left-4 top-10 bottom-[-10px] w-px bg-neutral-200" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
