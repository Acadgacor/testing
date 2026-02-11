"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { formatContent } from "@/lib/formatText";

export default function DiagnosisPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Mohon upload file gambar (JPG/PNG).");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("Ukuran file maksimal 10MB.");
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
            setResult(null); // Reset result on new upload
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const analyzeSkin = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const headers: HeadersInit = { "Content-Type": "application/json" };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch("/api/skin-ai", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    mode: "diagnosis", // Use the new Diagnosis Mode
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Buatkan medical report untuk kondisi kulit ini." },
                                { type: "image_url", image_url: { url: selectedImage } },
                            ],
                        },
                    ],
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Gagal melakukan analisis.");
            }

            const data = await res.json();
            setResult(data.content);
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan saat analisis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const consultWithAI = () => {
        if (result) {
            sessionStorage.setItem("lastSkinAnalysis", result);
            router.push("/Ai");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Skin Diagnosis Center</h1>
                    <p className="mt-2 text-sm text-gray-600">Advanced AI-powered dermatological analysis</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">

                    {/* Upload Area */}
                    {!result && (
                        <div className="p-8">
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out ${selectedImage ? "border-brand-primary bg-brand-primary/5" : "border-gray-300 hover:border-brand-primary hover:bg-gray-50"
                                    }`}
                            >
                                {selectedImage ? (
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-48 h-48 mb-4 rounded-lg overflow-hidden shadow-md">
                                            <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                        </div>
                                        <button
                                            onClick={() => { setSelectedImage(null); fileInputRef.current!.value = ""; }}
                                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Ganti Foto
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-700 font-medium">Drag & drop foto wajah di sini</p>
                                        <p className="text-gray-400 text-xs">atau</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition"
                                        >
                                            Pilih File
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            {/* Action Button */}
                            {selectedImage && !isAnalyzing && (
                                <button
                                    onClick={analyzeSkin}
                                    className="mt-6 w-full py-3 bg-brand-primary text-brand-dark font-bold rounded-xl shadow-md hover:bg-brand-primary-hover transition-all transform hover:scale-[1.01]"
                                >
                                    Mulai Analisis Kulit
                                </button>
                            )}

                            {/* Loading State */}
                            {isAnalyzing && (
                                <div className="mt-8 flex flex-col items-center animate-pulse">
                                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-brand-dark font-medium text-lg">Menganalisis tekstur kulit...</p>
                                    <p className="text-gray-500 text-sm mt-1">Mohon tunggu sebentar</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result Card (Medical Report) */}
                    {result && (
                        <div className="p-8 bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Medical Analysis Report
                                </h2>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">Completed</span>
                            </div>

                            <div
                                className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatContent(result) }}
                            />

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={consultWithAI}
                                    className="flex-1 py-3 bg-brand-primary text-brand-dark font-bold rounded-xl shadow-md hover:bg-brand-primary-hover transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Konsultasi dengan AI Assistant
                                </button>
                                <button
                                    onClick={() => { setResult(null); setSelectedImage(null); }}
                                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Scan Ulang
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
