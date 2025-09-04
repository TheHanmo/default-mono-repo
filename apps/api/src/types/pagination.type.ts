import { Meta } from '@app-types/api-response.type';

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: Meta;
}
