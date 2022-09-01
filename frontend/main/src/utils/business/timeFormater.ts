import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const setStartTime = (day: Dayjs) => {
  return day.startOf('day').format();
};

export const setEndTime = (day: Dayjs) => {
  return day.endOf('day').format();
};

export const getDate = (day: Date) => {
  return dayjs(day).format('YYYY-MM-DD');
};

export const getDateTime = (day: Date) => {
  return dayjs(day).format('YYYY-MM-DD HH:mm:ss');
};
