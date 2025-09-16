import { format, formatDistanceToNowStrict, isToday } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

export const formatNumber = (value: number, defaultValue = '0') => {
  if (!value) return defaultValue;

  return value.toLocaleString();
};

export const formatDate = (value?: string | Date, includeTime = true) => {
  if (!value) return '-';

  return format(new Date(value), includeTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd');
};

export const relativeTime = (value?: string | Date) => {
  if (!value) return '-';

  const date = new Date(value);

  if (!isToday(date)) {
    return formatDate(value);
  }

  return formatDistanceToNowStrict(date, { addSuffix: true, locale: ko });
};

export const formatMonth = (value?: string | Date) => {
  if (!value) return '-';

  return format(new Date(value), 'yyyy-MM');
};
