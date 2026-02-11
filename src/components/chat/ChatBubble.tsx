import { ChatMessage } from "@/hooks/useSkinChat";
import { formatContent } from "@/lib/formatText";

interface ChatBubbleProps {
    message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === "user";

    // Extract text only (image support removed)
    let textContent = "";

    if (typeof message.content === "string") {
        textContent = message.content;
    } else if (Array.isArray(message.content)) {
        message.content.forEach((part) => {
            if (part.type === "text" && part.text) {
                textContent += part.text;
            }
        });
    }

    return (
        <div className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
            {/* Bot Icon - Only for AI */}
            {!isUser && (
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
            )}

            <div
                className={`relative max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm md:max-w-[75%] ${isUser
                        ? "rounded-2xl rounded-tr-sm bg-black text-white"
                        : "rounded-2xl rounded-tl-sm border border-gray-200 bg-white text-gray-800"
                    }`}
            >
                {textContent && (
                    <div
                        className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""
                            }`}
                        dangerouslySetInnerHTML={{ __html: formatContent(textContent) }}
                    />
                )}
            </div>
        </div>
    );
}
