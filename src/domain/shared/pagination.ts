export interface PaginationInput {
  page: number;
  limit: number;
}

export interface PaginatedOutput<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function toPagination(page?: number, limit?: number): PaginationInput {
  const p = Number.isFinite(page) && page! > 0 ? page! : 1;
  const l = Number.isFinite(limit) && limit! > 0 ? limit! : 20;
  return { page: p, limit: Math.min(100, l) };
}
