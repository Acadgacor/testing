"use client";

import { useSkinChat } from "@/hooks/useSkinChat";
import ChatBubble from "@/features/chat/components/ChatBubble";
import ChatInput from "@/features/chat/components/ChatInput";
import Image from "next/image";

const starterPrompts = [
  "Kulitku sering jerawatan dan berminyak, skincare apa yang cocok?",
  "Ada ruam merah di pipi setelah pakai produk baru, harus gimana?",
  "Tolong buatin rutinitas pagi/malam untuk kulit kering dan sensitif.",
];

export default function AiPage() {
  const {
    messages,
    input,
    setInput,
    loading,
    analysisContext,
    clearAnalysisContext,
    sendMessage,
    listRef,
  } = useSkinChat();

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col bg-gray-50 overflow-hidden">
      {/* HEADER - Fixed at top of flex container */}
      <header className="shrink-0 z-40 w-full border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-100">
              <Image
                src="/logo.webp"
                alt="Beaulytics AI"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Beaulytics AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-600">
                  Online & Ready
                </span>
              </div>
            </div>
          </div>
          {analysisContext && (
            <button
              onClick={clearAnalysisContext}
              className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
            >
              Hapus Konteks
            </button>
          )}
        </div>
        {analysisContext && (
          <div className="mx-auto mt-2 max-w-3xl rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Running with active analysis context.
          </div>
        )}
      </header>

      {/* MAIN CHAT AREA - Scrollable */}
      <main className="flex-1 w-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-32 pt-6 min-h-full">
          {messages.length === 0 ? (
            /* EMPTY STATE / WELCOME */
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-10 w-10 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Halo! Ada yang bisa saya bantu?
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                Saya Beaulytics AI. Tanyakan tentang masalah kulit, rekomendasi
                produk, atau rutinitas skincare harianmu.
              </p>

              <div className="mt-8 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 shadow-sm hover:shadow-md hover:border-black/20 hover:-translate-y-0.5 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* MESSAGES LIST */
            <div ref={listRef} className="space-y-6">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} message={msg} />
              ))}

              {loading && (
                <div className="flex w-full justify-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M16.5 7.5h-9v9h9v-9z" opacity="0.3" />
                      <path d="M21.75 12a.75.75 0 00-.75-.75H3a.75.75 0 000 1.5h18a.75.75 0 00.75-.75zM12 2.25a.75.75 0 00-.75.75v1.5h1.5V3a.75.75 0 00-.75-.75zM6.75 6a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0v-9H16.5v9a.75.75 0 001.5 0V6.75a.75.75 0 00-.75-.75H6.75z" />
                    </svg>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-5 py-4 text-gray-800 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invisble spacer for auto-scroll */}
              <div className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* INPUT */}
      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        sendMessage={sendMessage}
      />
    </div>
  );
}
