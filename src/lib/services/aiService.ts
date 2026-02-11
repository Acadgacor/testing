import Groq from "groq-sdk";

const VISION_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";
const BRAIN_MODEL = "openai/gpt-oss-120b";

const CHAT_MAX_TOKENS = Number(process.env.NEXT_GROQ_MAX_TOKENS || 2048);
const ANALYSIS_MAX_TOKENS = Number(process.env.NEXT_GROQ_ANALYSIS_MAX_TOKENS || 256);

const VISION_SYSTEM_PROMPT =
    "Anda adalah analis dermatologi teknis. Deskripsikan kondisi kulit di foto ini secara SANGAT MENDETAIL (tekstur, warna, tipe jerawat, lokasi masalah). Jangan beri saran, HANYA fakta visual.";

const ANALYSIS_PROMPT =
    "You are an Indonesian dermatology assistant. Analyze the user's skin profile based on their answers. " +
    "Return ONLY a comma-separated list of short keywords (max 2-3 words per keyword). " +
    "Example: 'Kulit Berminyak, Rentan Jerawat, Pori Besar'. " +
    "No bullet points, no numbering, no introductions or conclusions—just the keywords.";

const CHAT_PROMPT =
    "You are a friendly and personal skincare and body care bestie. You speak in a warm, engaging, and casual Indonesian tone (using terms like 'Kak', 'Bestie'). " +
    "Your Goal: Provide a consultative dermatology experience.\n\n" +
    "STRICT RESPONSE FLOW (Follow this order):\n" +
    "1. ANALYSIS: Analyze the user's skin condition based on their description or image. Explain WHAT it is and WHY it might be happening (causes).\n" +
    "2. TIPS: Give immediate behavioral/lifestyle advice to reduce infection or aggravation (e.g., 'Jangan dipencet ya kak', 'Hindari makanan berminyak').\n" +
    "3. PERMISSION: **DO NOT** recommend specific products yet. Instead, ask the user: 'Mau aku rekomendasiin produk yang cocok buat kondisi ini, Bestie?'\n\n" +
    "RULES:\n" +
    "- If the user explicitly asks for products *after* you offered, THEN you can list valid products.\n" +
    "- If this is the FIRST interaction about a problem, NEVER list products immediately. Stick to Analysis + Tips + Permission.\n" +
    "- Refuse off-topic questions politely.";

const DIAGNOSIS_PROMPT =
    "You are a professional Dermatologist AI. Your task is to generate a structured Medical Report based on the patient's skin analysis.\n" +
    "Format your response EXACTLY as a JSON-like structure (but plain text is fine, just structured) with these sections:\n\n" +
    "**MEDICAL REPORT**\n" +
    "TARGET: [Patient Name/User]\n" +
    "DATE: [Current Date]\n\n" +
    "--- \n" +
    "**1. DETECTED CONDITIONS**\n" +
    "- [Condition 1] (e.g., Acne Vulgaris)\n" +
    "- [Condition 2] (e.g., Post-Inflammatory Hyperpigmentation)\n" +
    "- [Condition 3] (e.g., Oversized Pores)\n\n" +
    "**2. ANALYSIS**\n" +
    "[Detailed technical analysis of the visual evidence. Explain severity, distribution, and probable causes.]\n\n" +
    "**3. CLINICAL RECOMMENDATIONS**\n" +
    "- [Treatment 1]\n" +
    "- [Treatment 2]\n\n" +
    "**4. NEXT STEPS**\n" +
    "Please consult with our AI Assistant for a personalized product routine.\n" +
    "---";

interface MessageContent {
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string | MessageContent[];
}

interface ProcessSkinAnalysisParams {
    messages: Message[];
    mode?: "chat" | "analysis" | "diagnosis";
    apiKey: string;
}

export async function processSkinAnalysis({ messages, mode, apiKey }: ProcessSkinAnalysisParams) {
    const groq = new Groq({ apiKey });

    const lastMessage = messages[messages.length - 1];

    // Select Prompt based on Mode
    let finalSystemPrompt = CHAT_PROMPT;
    if (mode === "analysis") finalSystemPrompt = ANALYSIS_PROMPT;
    if (mode === "diagnosis") finalSystemPrompt = DIAGNOSIS_PROMPT;

    let finalUserContent = "";

    // Check if the last message contains an image
    const hasImage = Array.isArray(lastMessage.content) && lastMessage.content.some((c: any) => c.type === "image_url");

    if (hasImage && Array.isArray(lastMessage.content)) {
        // === STAGE 1: VISION ANALYSIS ===
        const imagePart = lastMessage.content.find((c: any) => c.type === "image_url");
        const textPart = lastMessage.content.find((c: any) => c.type === "text");
        const userText = textPart && textPart.type === "text" ? textPart.text : "";

        if (imagePart && imagePart.type === "image_url") {
            try {
                const visionCompletion = await groq.chat.completions.create({
                    model: VISION_MODEL,
                    messages: [
                        { role: "system", content: VISION_SYSTEM_PROMPT },
                        {
                            role: "user",
                            content: [
                                { type: "image_url", image_url: { url: imagePart.image_url!.url } },
                                { type: "text", text: "Deskripsikan kondisi kulit di gambar ini." },
                            ],
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 512,
                });

                const imageAnalysisResult = visionCompletion.choices[0]?.message?.content || "Gagal menganalisis gambar.";

                // Inject analysis into the final prompt
                finalUserContent = `Ini adalah hasil analisis visual wajah saya dari alat scanner: [${imageAnalysisResult}].\n\nPertanyaan saya: "${userText}"`;

            } catch (visionError) {
                console.error("Vision Step Error:", visionError);
                // Fallback if vision fails: tell brain model we couldn't analyze
                finalUserContent = `User mencoba mengirim gambar tetapi analisis visual gagal. Pertanyaan user: "${userText}"`;
            }
        }
    } else {
        // Text Only - Just use the content as is
        if (typeof lastMessage.content === "string") {
            finalUserContent = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
            finalUserContent = lastMessage.content
                .filter((c: any) => c.type === 'text')
                .map((c: any) => (c.type === 'text' ? c.text : ''))
                .join('\n');
        }
    }

    // === STAGE 2: BRAIN / REASONING ===

    // Prepare history for context
    const previousMessages = messages.slice(0, -1).map((m) => {
        let content = "";
        if (typeof m.content === "string") {
            content = m.content;
        } else {
            content = (m.content as MessageContent[])
                .filter(c => c.type === 'text')
                .map(c => (c.type === 'text' ? c.text : ''))
                .join(' ');
        }
        return { role: m.role, content };
    });

    const brainMessages = [
        { role: "system", content: finalSystemPrompt },
        ...previousMessages,
        { role: "user", content: finalUserContent },
    ];

    const isAnalysis = mode === "analysis";
    const temperature = isAnalysis ? 0.3 : 0.6;
    const maxTokens = isAnalysis ? ANALYSIS_MAX_TOKENS : CHAT_MAX_TOKENS;

    const completion = await groq.chat.completions.create({
        model: BRAIN_MODEL,
        messages: brainMessages as any,
        temperature,
        max_tokens: maxTokens,
    });

    return completion?.choices?.[0]?.message?.content ?? "";
}
