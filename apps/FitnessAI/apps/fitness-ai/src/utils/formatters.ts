export function formatKcal(value: number): string {
  return value.toLocaleString();
}

export function formatLiters(value: number): string {
  return `${value.toFixed(1)}L`;
}

export function greetingForHour(hour: number): "morning" | "afternoon" | "evening" {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
