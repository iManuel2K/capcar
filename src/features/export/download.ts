export function downloadTextFile(
  filename: string,
  content: string,
  type = "application/json",
) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  downloadFile(filename, blob);
}

export function downloadFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}
