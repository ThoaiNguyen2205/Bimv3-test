import { format, getTime, formatDistanceToNow } from 'date-fns';

import vi from 'date-fns/locale/vi';
// ----------------------------------------------------------------------

type InputValue = Date | string | number | null;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy';
  return date ? format(new Date(date), fm) : '';
}
export function fDateVi(date: InputValue, newFormat?: string) {
  const fmVi = newFormat || 'dd MMMM yyyy';
  return date ? format(new Date(date), fmVi, { locale: vi }) : '';
}
export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}
export function fDateTimeVi(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm, { locale: vi }) : '';
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true
      })
    : '';
}
