import { Date } from '../types/date';

export function isDateValid(date: Date): boolean {
    if (!date) return false;
    const { year, month, day } = date;

    if (
        typeof year !== 'number' ||
        typeof month !== 'number' ||
        typeof day !== 'number'
    ) {
        return false;
    }

    if (month < 1 || month > 12) {
        return false;
    }

    if (day < 1 || day > 31) {
        return false;
    }

    return true;
}

export function sortDate(date: Date) {
    const { year, month, day } = date;

    return {
        year,
        month,
        day,
    };
}
