import { Collection, Sort, Document } from 'mongodb';

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
export function getPaginatedData<T extends Document>(
    collection: Collection<T>,
    pageNumber: number,
    pageSize: number,
    sort?: Sort,
    filter?: any,
) {
    if (pageNumber < 1) throw new Error('Page number must be greater than 0');
    if (pageSize < 1) throw new Error('Page size must be greater than 0');

    const skip = (pageNumber - 1) * pageSize;

    return collection
        .find<T>(filter || {})
        .sort(sort || { _id: 1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();
}

export function getPaginationPageCount<DocType extends Document>(
    collection: Collection<DocType>,
    pageSize: number,
    filter?: any,
) {
    return collection.countDocuments(filter || {}).then((count) => {
        return Math.ceil(count / pageSize);
    });
}
