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

export function toPagination(page = 1, limit = 20): PaginationInput {
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  };
}
