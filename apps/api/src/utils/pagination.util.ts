import { PaginationOptions, PaginationQuery, PaginationResult } from '@app-types/pagination.type';

export function getPagination(query: PaginationQuery): PaginationOptions {
  const page = Math.max(1, Number(query?.page) || 1);
  const pageSize = Math.max(1, Number(query?.pageSize) || 10);
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

export function getPaginationResult<T>(
  data: T[],
  totalCount: number,
  page: number,
  pageSize: number,
): PaginationResult<T> {
  const totalPage = Math.ceil(totalCount / pageSize);
  const currentPage = Math.max(1, page);

  return {
    data,
    meta: {
      totalCount,
      currentPage,
      pageSize,
      totalPage,
    },
  };
}
