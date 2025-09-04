import { Transform } from 'class-transformer';

import dayjs from '@utils/dayjs.util';

export function TransformDate() {
  return Transform(({ value }: { value: unknown }) =>
    value instanceof Date ? dayjs(value).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss') : value,
  );
}
