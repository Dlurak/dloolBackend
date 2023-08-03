import { usersCollection } from '../user/user';
import { Collection, SortDirection } from 'mongodb';

export function getPaginatedData(
    collection: Collection,
    pageNumber: number,
    pageSize: number,
    sortKey?: string,
    sortOrder?: SortDirection,
) {
    if (pageNumber < 1) throw new Error('Page number must be greater than 0');
    if (pageSize < 1) throw new Error('Page size must be greater than 0');

    const skip = (pageNumber - 1) * pageSize;

    if (!sortKey) {
        sortKey = '_id';
    }
    if (!sortOrder) {
        sortOrder = 1;
    }

    return collection
        .find()
        .sort({ [sortKey]: sortOrder })
        .skip(skip)
        .limit(pageSize)
        .toArray();
}
