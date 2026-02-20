import { useState, useEffect, useRef } from "react";
import { getSupabaseClient } from "@/shared/lib/supabaseClient";

export type ChatContentPart = {
    type: "text";
    text?: string;
};

export type ChatMessage = {
    role: "user" | "assistant";
    content: string | ChatContentPart[];
    action?: "login" | null;
};

export function useSkinChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: "assistant",
            content:
                "Halo! Aku asisten dermatologi virtual. Ceritakan kondisi kulitmu atau produk yang dipakai, biar aku bantu kasih saran skincare. Ini bukan pengganti dokter—untuk kasus gawat, segera konsultasi langsung ke profesional, ya!",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysisContext, setAnalysisContext] = useState<string | null>(null);

    const listRef = useRef<HTMLDivElement | null>(null);

    // 1. AUTO-DETECT CONTEXT
    useEffect(() => {
        const savedAnalysis = sessionStorage.getItem("lastSkinAnalysis");
        if (savedAnalysis) {
            setAnalysisContext(savedAnalysis);
            // Optional: Add automated opening message if not already present
            setMessages((prev) => {
                // Only add if we haven't added it yet (simple check)
                const hasContextMsg = prev.some(
                    (m) =>
                        typeof m.content === "string" && m.content.includes("Konteks medis aktif")
                );
                if (!hasContextMsg && prev.length === 1) {
                    return [
                        ...prev,
                        {
                            role: "assistant",
                            content:
                                "Halo! Saya sudah lihat hasil analisis kulitmu dari halaman Diagnosis. Ada yang ingin ditanyakan tentang masalah kulit yang terdeteksi? (Konteks medis aktif)",
                        },
                    ];
                }
                return prev;
            });
        }
    }, []);

    // 2. AUTO-SCROLL
    useEffect(() => {
        listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const clearAnalysisContext = () => {
        sessionStorage.removeItem("lastSkinAnalysis");
        setAnalysisContext(null);
        setMessages([
            {
                role: "assistant",
                content:
                    "Konteks analisis sebelumnya telah dihapus. Mulai sesi konsultasi baru ya!",
            },
        ]);
    };

    async function sendMessage(content?: string) {
        const text = (content ?? input).trim();
        if (!text || loading) return;

        let userMessage: ChatMessage;
        userMessage = { role: "user", content: text };

        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput("");
        setLoading(true);

        try {
            const supabase = getSupabaseClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;

            // 1. Check valid session before Fetching
            if (!session || !token) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "Untuk menggunakan fitur AI Chat, silakan login atau register terlebih dahulu ya!",
                        action: "login",
                    },
                ]);
                setLoading(false);
                return;
            }

            const headers: HeadersInit = { "Content-Type": "application/json" };
            headers["Authorization"] = `Bearer ${token}`;

            // PREPARE PAYLOAD WITH CONTEXT INJECTION
            const payloadMessages = JSON.parse(JSON.stringify(nextMessages));

            if (analysisContext) {
                const lastMsg = payloadMessages[payloadMessages.length - 1];
                const contextString = `\n\n[SYSTEM CONTEXT: User has a previous Skin Diagnosis Report. Use this reference: ${analysisContext}]\n`;

                if (typeof lastMsg.content === "string") {
                    lastMsg.content += contextString;
                } else if (Array.isArray(lastMsg.content)) {
                    const textPart = lastMsg.content.find((p: any) => p.type === "text");
                    if (textPart) {
                        textPart.text += contextString;
                    } else {
                        lastMsg.content.push({ type: "text", text: contextString });
                    }
                }
            }

            const res = await fetch("/api/skin-ai", {
                method: "POST",
                headers,
                body: JSON.stringify({ mode: "chat", messages: payloadMessages }),
            });
            if (!res.ok) {
                // Handle 401 Unauthorized from Server
                if (res.status === 401) {
                    throw new Error("Missing Authorization header");
                }

                let reason = "Gagal menghubungi AI";
                try {
                    const err = await res.json();
                    if (err?.error)
                        reason = `${err.error}${err?.status ? ` (${err.status})` : ""}`;
                    if (err?.detail) reason += ` — ${String(err.detail).slice(0, 200)}`;
                } catch { }
                throw new Error(reason);
            }
            const data = await res.json();
            const reply = data?.content?.trim();
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        reply ||
                        "Maaf, terjadi kendala memproses permintaanmu. Coba ulangi atau cek koneksi ya.",
                },
            ]);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error?.message || "";

            // Handle Auth Error specifically
            if (errorMessage.includes("Missing Authorization") || errorMessage.includes("Unauthorized")) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "Sesi login kamu berakhir atau belum login. Silakan login kembali untuk melanjutkan chat.",
                        action: "login",
                    },
                ]);
            } else {
                const detail = errorMessage ? ` (${errorMessage})` : "";
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: `Aku mengalami gangguan saat terhubung. Pastikan internet stabil dan coba lagi ya.${detail}`,
                    },
                ]);
            }
        } finally {
            setLoading(false);
        }
    }

    return {
        messages,
        input,
        setInput,
        loading,
        analysisContext,
        clearAnalysisContext,
        sendMessage,
        listRef,
    };
}
