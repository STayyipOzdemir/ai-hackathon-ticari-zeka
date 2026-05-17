"use client";

function trigger(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/["\n,]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  trigger(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

export function downloadJSON(filename: string, data: unknown) {
  trigger(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    filename
  );
}
