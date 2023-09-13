import { DateTime } from 'luxon'

export const formatDate = (isoString : string) => {
    return DateTime.fromISO(isoString).toFormat('dd.MM.yyyy - T');
}

export function checkIfTimeSpansIntersect(startTime1: DateTime, endTime1: DateTime, startTime2: DateTime, endTime2: DateTime): boolean {
    return startTime1 < endTime2 && startTime2 < endTime1;
}
