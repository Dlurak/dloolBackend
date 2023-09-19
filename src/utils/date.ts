import { Date, DateTime, Time } from '../types/date';

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

export function isTimeValid(time: Time): boolean {
    if (!time) return false;
    const { hour, minute } = time;

    if (typeof hour !== 'number' || typeof minute !== 'number') {
        return false;
    }

    if (hour < 0 || hour > 23) {
        return false;
    }

    if (minute < 0 || minute > 59) {
        return false;
    }

    return true;
}

export function isDateTimeValid(dateTime: DateTime): boolean {
    if (!dateTime) return false;

    const dateIsValid = isDateValid(dateTime);
    const timeIsValid = isTimeValid(dateTime);

    return dateIsValid && timeIsValid;
}

export function sortDate(date: Date) {
    const { year, month, day } = date;

    return {
        year,
        month,
        day,
    };
}

export function sortDateTime(dateTime: DateTime) {
    const { year, month, day, hour, minute } = dateTime;

    return {
        year,
        month,
        day,
        hour,
        minute,
    };
}
