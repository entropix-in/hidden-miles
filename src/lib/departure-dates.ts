const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

function utcDate(date: string) { return new Date(`${date}T00:00:00Z`); }
function isoDate(date: Date) { return date.toISOString().slice(0, 10); }

export function dateLabel(date: string) { return dateFormatter.format(utcDate(date)); }
export function monthLabel(month: string) { return monthFormatter.format(utcDate(`${month}-01`)); }
export function calendarToday() { return new Date().toISOString().slice(0, 10); }
export function shiftDay(value: string, offset: number) {
  const date = utcDate(value);
  date.setUTCDate(date.getUTCDate() + offset);
  return isoDate(date);
}
export function shiftMonth(month: string, offset: number) {
  const date = utcDate(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return isoDate(date).slice(0, 7);
}
export function calendarDays(month: string) {
  const weekday = utcDate(`${month}-01`).getUTCDay();
  const last = utcDate(shiftDay(`${shiftMonth(month, 1)}-01`, -1)).getUTCDate();
  return Array.from({ length: Math.ceil((weekday + last) / 7) * 7 }, (_, index) => {
    const day = index - weekday + 1;
    return day >= 1 && day <= last ? `${month}-${String(day).padStart(2, "0")}` : null;
  });
}
