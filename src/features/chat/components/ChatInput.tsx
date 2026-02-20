interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    loading: boolean;
    sendMessage: (content?: string) => Promise<void>;
}

export default function ChatInput({
    input,
    setInput,
    loading,
    sendMessage,
}: ChatInputProps) {
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        sendMessage();
    }

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full bg-white px-4 pb-6 pt-2">
            {/* Gradient Fade Top */}
            <div className="pointer-events-none absolute left-0 top-0 h-24 w-full -translate-y-full bg-gradient-to-t from-white to-transparent" />

            <div className="mx-auto max-w-3xl">
                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all"
                >
                    {/* Upload Button (Visual Only) */}
                    <button
                        type="button"
                        disabled={loading}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                            />
                        </svg>
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder="Tanya Beaulytics AI..."
                        className="flex-1 bg-transparent px-2 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        aria-label="Kirim pesan"
                    >
                        {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-4 w-4 translate-x-[1px]"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                />
                            </svg>
                        )}
                    </button>
                </form>
                <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-400">
                        AI dapat membuat kesalahan. Selalu konsultasikan dengan dokter.
                    </p>
                </div>
            </div>
        </div>
    );
}
