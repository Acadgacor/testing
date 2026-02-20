export function toStr(value?: string | string[] | null): string {
  if (Array.isArray(value)) return value[0];
  return value ?? "";
}

export function safeDecode(value?: string | string[] | null): string {
  if (!value) return "";
  try {
    return decodeURIComponent(toStr(value));
  } catch {
    return String(toStr(value));
  }
}
