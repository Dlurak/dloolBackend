import { School, schoolsCollection } from './school';

/**
 *  Creates a school in the database
 * @param school The school to create
 * @returns A promise that resolves to true if the school was created successfully, false otherwise
 */
export function createSchool(school: School) {
    return schoolsCollection
        .insertOne(school)
        .then(() => {
            return true;
        })
        .catch(() => {
            return false;
        });
}
