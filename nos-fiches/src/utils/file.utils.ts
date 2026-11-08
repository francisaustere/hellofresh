/** Today as YYYY-MM-DD in local time, for file names. */
export function todayStamp(date: Date = new Date()): string {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Saves a text file through the browser's downloads. */
export function downloadText(fileName: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking right away can cancel the download in Safari
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
