import { DateTime } from 'luxon'

export const formatDate = (isoString : string) => {
    return DateTime.fromISO(isoString).toFormat('dd.MM.yyyy - T');
}
