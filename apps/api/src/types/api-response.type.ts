export interface Meta {
  totalCount: number; // 전체 데이터 개수 (필터링/검색 포함)
  currentPage: number; // 현재 페이지 번호
  pageSize: number; // 한 페이지에 표시되는 데이터 개수
  totalPage: number; // 전체 페이지 수
  sortBy?: string; // 정렬 기준 컬럼명 (예: 'created_at')
  order?: 'asc' | 'desc'; // 정렬 순서 ('asc' 오름차순, 'desc' 내림차순)
  filters?: Record<string, any>; // 적용된 필터 정보 (ex: { status: 'active' })
  search?: string; // 적용된 검색어
  hasNextPage?: boolean; // 다음 페이지 존재 여부
  hasPrevPage?: boolean; // 이전 페이지 존재 여부
}

export interface ApiResponseDto<T = unknown> {
  success: boolean;
  message: string;
  errorCode?: string | null;
  data: T;
  meta?: Meta;
}
