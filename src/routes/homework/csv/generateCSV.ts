import { WithId } from 'mongodb';
import { Homework } from '../../../database/homework/homework';

export const generateFullCsv = (homework: WithId<Homework>[]) => {
    const csvCols = [
        'Parent Id',
        'class',
        'creator',
        'createdAt',

        'from:year',
        'from:month',
        'from:day',

        'subject',
        'description',
        'due:year',
        'due:month',
        'due:day',
    ] as const;

    const csvRows: string[][] = [[...csvCols]];

    const assignmentList = homework
        .map((hw) => {
            const {
                _id,
                assignments,
                class: classId,
                createdAt,
                creator,
                from,
            } = hw;

            return assignments.map((assignment) => ({
                'Parent Id': _id,
                class: classId,
                creator,
                createdAt,

                'from:year': from.year,
                'from:month': from.month,
                'from:day': from.day,

                subject: assignment.subject,
                description: assignment.description,
                'due:year': assignment.due.year,
                'due:month': assignment.due.month,
                'due:day': assignment.due.day,
            }));
        })
        .flat();

    assignmentList.forEach((assignment) => {
        const csvRowCols: string[] = [];
        csvCols.forEach((col) => csvRowCols.push(assignment[col] + ''));
        csvRows.push(csvRowCols);
    });

    return csvRows
        .map((row) => row.map((col) => col.replace(/\|/g, ' ')).join('|'))
        .join('\n');
};
