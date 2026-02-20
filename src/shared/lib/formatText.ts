export function escapeHtml(str: string) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formatInline(text: string) {
    let html = escapeHtml(text);
    // decode common escaped tags from model output
    html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br />").replace(/&amp;nbsp;/gi, " ");
    // bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
    // italic *text*
    html = html.replace(/(^|[\s>])\*(?!\*)([^*]+?)\*(?!\*)/g, "$1<em>$2</em>");
    html = html.replace(/(^|[\s>])_(?!_)([^_]+?)_(?!_)/g, "$1<em>$2</em>");
    return html;
}

function isTableLine(line: string) {
    const trimmed = line.trim();
    return trimmed.startsWith("|") && trimmed.split("|").length > 3;
}

function isSeparatorLine(line: string) {
    return /^\s*\|?(?:\s*:?-+:?\s*\|)+\s*$/.test(line);
}

function parseRow(line: string) {
    const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return inner.split("|").map((c) => c.trim());
}

function tableBlockToHtml(block: string[]) {
    if (block.length < 2 || !isSeparatorLine(block[1])) return block.join("\n");
    const header = parseRow(block[0]);
    const rows = block.slice(2).map(parseRow);
    const th = header
        .map(
            (h) =>
                `<th class="border border-brand-primary/20 bg-brand-secondary/60 px-3 py-2 text-left text-[11px] sm:text-xs font-semibold text-brand-dark">${formatInline(
                    h
                )}</th>`
        )
        .join("");
    const trs = rows
        .map((r) => {
            const tds = r
                .map(
                    (c) =>
                        `<td class="border border-brand-primary/15 px-3 py-2 align-top text-[11px] sm:text-xs text-brand-dark">${formatInline(
                            c
                        )}</td>`
                )
                .join("");
            return `<tr>${tds}</tr>`;
        })
        .join("");
    return `<div class="overflow-x-auto -mx-1 sm:mx-0"><table class="min-w-full border-collapse rounded-2xl overflow-hidden text-xs sm:text-sm shadow-sm"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function inlinePipeRow(line: string) {
    const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length);
    if (cells.length < 2) return null;
    const tds = cells
        .map(
            (c) =>
                `<td class="border border-brand-primary/15 px-3 py-2 align-top text-[11px] sm:text-xs text-brand-dark">${formatInline(
                    c
                )}</td>`
        )
        .join("");
    return `<div class="overflow-x-auto -mx-1 sm:mx-0 mb-2"><table class="min-w-full border-collapse rounded-2xl overflow-hidden text-xs sm:text-sm shadow-sm"><tbody><tr>${tds}</tr></tbody></table></div>`;
}

function splitIntoSegments(text: string) {
    const lines = text.split("\n");
    const segments: { type: "table" | "text"; content: string }[] = [];
    let i = 0;
    let buffer: string[] = [];
    const flushBuffer = () => {
        if (buffer.length) {
            segments.push({ type: "text", content: buffer.join("\n") });
            buffer = [];
        }
    };
    while (i < lines.length) {
        if (isTableLine(lines[i])) {
            const start = i;
            while (i < lines.length && isTableLine(lines[i])) i++;
            const block = lines.slice(start, i);
            flushBuffer();
            segments.push({ type: "table", content: tableBlockToHtml(block) });
            continue;
        }
        buffer.push(lines[i]);
        i++;
    }
    flushBuffer();
    return segments;
}

export function formatContent(text: string) {
    const segments = splitIntoSegments(text.trim());
    const formatted = segments
        .map((seg) => {
            if (seg.type === "table") return seg.content;

            const lines = seg.content.split("\n");
            const renderedLines = lines.map((line) => {
                if (/^\s*-{3,}\s*$/.test(line)) return ""; // remove horizontal rules
                const inlineTable = line.includes("|") && !isTableLine(line);
                if (inlineTable) {
                    const row = inlinePipeRow(line);
                    if (row) return row;
                }
                const headingMatch = line.match(/^\s*#{1,6}\s*(.*)$/);
                const base = headingMatch ? headingMatch[1] : line;
                let html = formatInline(base);
                // bullets and numbering
                html = html.replace(/^\s*-+\s+/g, "• ").replace(/^\s*(\d+)\.\s+/g, "$1. ");
                // strip stray heading markers if any slipped
                html = html.replace(/^#+\s*/g, "");

                if (headingMatch) {
                    return `<div class="font-semibold text-brand-dark text-sm sm:text-base">${html}</div>`;
                }
                return html;
            });

            return renderedLines.join("<br />");
        })
        .join("<br />");
    return formatted;
}
