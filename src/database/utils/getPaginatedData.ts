import { Collection, SortDirection } from 'mongodb';

/**
 * A function to get paginated data from a collection
 * @param collection The collection to get the data from
 * @param pageNumber Which page to get
 * @param pageSize How many items per page
 * @param sortKey The optional key to sort by, defaults to _id
 * @param sortOrder The optional sort order, defaults to 1
 * @returns A list of items from the collection
 */
export function getPaginatedData(
    collection: Collection<any>,
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
