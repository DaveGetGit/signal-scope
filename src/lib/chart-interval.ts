import { TimeInterval } from "@/features/samples/api/types";

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

export function getIntervalForRange(
  startTime?: number,
  endTime?: number,
): TimeInterval {
  if (startTime === undefined || endTime === undefined) {
    return TimeInterval.OneHour;
  }

  const duration = Math.max(endTime - startTime, ONE_MINUTE);

  if (duration <= ONE_DAY) {
    return TimeInterval.OneMinute;
  }

  if (duration <= 7 * ONE_DAY) {
    return TimeInterval.FifteenMinutes;
  }

  if (duration <= 30 * ONE_DAY) {
    return TimeInterval.OneHour;
  }

  if (duration <= 180 * ONE_DAY) {
    return TimeInterval.FourHours;
  }

  if (duration <= 366 * ONE_DAY) {
    return TimeInterval.OneDay;
  }

  return TimeInterval.OneWeek;
}
