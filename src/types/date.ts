export interface Date {
    year: number;
    month: number;
    day: number;
}

export interface Time {
    hour: number;
    minute: number;
}

export interface DateTime extends Date, Time {}
