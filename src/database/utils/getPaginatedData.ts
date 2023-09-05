import { Collection, Sort, SortDirection } from 'mongodb';

/**
 * A function to get paginated data from a collection
 * @param collection The collection to get the data from
 * @param pageNumber Which page to get
 * @param pageSize How many items per page
 * @param sortKey The optional key to sort by, defaults to _id
 * @param sortOrder The optional sort order, defaults to 1
 * @param filter The optional filter to apply to the query
 * @returns A list of items from the collection
 */
export function getPaginatedData(
    collection: Collection<any>,
    pageNumber: number,
    pageSize: number,
    sort?: Sort,
    filter?: any,
) {
    if (pageNumber < 1) throw new Error('Page number must be greater than 0');
    if (pageSize < 1) throw new Error('Page size must be greater than 0');

    const skip = (pageNumber - 1) * pageSize;

    return collection
        .find(filter || {})
        .sort(sort || { _id: 1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();
}
