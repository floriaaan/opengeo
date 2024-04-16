export function isDateOlderThan(input: Date | string, days: number): boolean {
  if (!input) return false;
  const tmp = new Date(input?.toString());

  // Calculate the date one week ago
  const date = new Date();
  date.setDate(new Date().getDate() - days);

  // Compare dateA with one week ago
  return tmp < date;
}
