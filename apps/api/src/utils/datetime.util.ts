import dayjs from '@utils/dayjs.util'; // dayjs.tz 설정 필수(Asia/Seoul, utc, timezone 플러그인)

const RE_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/; // 2025-09-09
const RE_DATE_TIME = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/; // 2025-09-09 00:00:00 or with T
const RE_ISO_TZ = /^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:\d{2})$/;

export function parseToKstDate(input: string | Date): Date {
  if (input instanceof Date) return input;

  if (RE_DATE_ONLY.test(input)) {
    // 'YYYY-MM-DD' → KST 자정
    return dayjs.tz(input, 'YYYY-MM-DD', 'Asia/Seoul').startOf('day').toDate();
  }

  if (RE_DATE_TIME.test(input)) {
    const normalized = input.replace(' ', 'T');
    return dayjs.tz(normalized, 'YYYY-MM-DDTHH:mm:ss', 'Asia/Seoul').toDate();
  }

  if (RE_ISO_TZ.test(input)) {
    // 이미 타임존 포함 → 그대로 파싱
    return dayjs(input).toDate();
  }

  // 마지막 방어: KST 가정
  return dayjs.tz(input, 'Asia/Seoul').toDate();
}

export function diffDaysInclusiveKST(a: Date, b: Date): number {
  const s = dayjs(a).tz('Asia/Seoul').startOf('day');
  const e = dayjs(b).tz('Asia/Seoul').startOf('day');
  return e.diff(s, 'day') + 1;
}
