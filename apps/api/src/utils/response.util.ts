import { ApiResponseDto, Meta } from '@app-types/api-response.type';

export function responseSuccess<T>(
  data: T,
  message = '요청이 성공적으로 처리되었습니다.',
): ApiResponseDto<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function responseSuccessWithMeta<T>(
  data: T,
  message = '요청이 성공적으로 처리되었습니다.',
  meta: Meta,
): ApiResponseDto<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

export function responseFail<T = null>(
  message = '요청에 실패하였습니다.',
  data: T = null as T,
  errorCode: string | null = null,
): ApiResponseDto<T> {
  return {
    success: false,
    message,
    data,
    errorCode: errorCode ?? null,
  };
}
