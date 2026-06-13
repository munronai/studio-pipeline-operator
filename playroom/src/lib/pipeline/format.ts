/** Shared formatters for the pipeline surfaces. */

export function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1000) {
    const k = n / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `$${n.toLocaleString()}`;
}

export function moneyFull(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString()}`;
}

/** Relative time, e.g. "3d ago", "in 2h", "just now". */
export function relTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = then - Date.now();
  const past = diff < 0;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hrs = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  let label: string;
  if (mins < 1) return "just now";
  if (mins < 60) label = `${mins}m`;
  else if (hrs < 24) label = `${hrs}h`;
  else if (days < 30) label = `${days}d`;
  else label = `${Math.round(days / 30)}mo`;
  return past ? `${label} ago` : `in ${label}`;
}

/** Due-date phrasing for next_action_due / appointments. */
export function dueLabel(iso: string | null | undefined): { text: string; overdue: boolean } {
  if (!iso) return { text: "", overdue: false };
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return { text: "", overdue: false };
  const diff = then - Date.now();
  const overdue = diff < 0;
  return { text: relTime(iso), overdue };
}

/** YYYY-MM-DD for a date input from an ISO string. */
export function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

/** YYYY-MM-DDTHH:mm for a datetime-local input. */
export function toDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

/** Parse a date-input value (local) back to ISO, or null. */
export function fromInput(val: string): string | null {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
