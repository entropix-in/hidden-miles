export function splitEnquiryMessage(value?: string) {
  const raw = value?.trim() ?? "";
  const match = /^Interested in: *([^\r\n.]+?)(?:\.\s*|\r?\n+)([\s\S]*)$/i.exec(raw);

  return {
    interest: match?.[1].trim(),
    message: (match?.[2] ?? raw).trim(),
  };
}
