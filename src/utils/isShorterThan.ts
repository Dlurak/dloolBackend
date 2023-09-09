import { isString } from './isDatatype';

export const isShorterThan = (str: string, length: number) => {
    if (!isString(str)) return false;
    return str.length < length;
};

export const isLongerThan = (str: string, length: number) => {
    if (!isString(str)) return false;
    return str.length > length;
};
