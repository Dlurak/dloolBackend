import { readFileSync } from 'fs';

export const timezoneOffsets: number[] = JSON.parse(
    readFileSync('src/constant/constants.json', 'utf-8')
).timezones;

