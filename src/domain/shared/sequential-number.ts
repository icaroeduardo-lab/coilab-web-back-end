export const SEQUENTIAL_NUMBER_REGEX = /^#\d{8}$/;

export function generateNextNumber(last: string | null): string {
  const year = new Date().getFullYear();

  if (!last) {
    return `#${year}0001`;
  }

  const lastYear = parseInt(last.slice(1, 5), 10);
  const lastSeq = parseInt(last.slice(5), 10);

  if (lastYear < year) {
    return `#${year}0001`;
  }

  const next = String(lastSeq + 1).padStart(4, '0');
  return `#${year}${next}`;
}
