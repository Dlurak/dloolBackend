import express from 'express';
import { eventsCollection } from '../../../database/events/event';

const generateCsvRow = (cols: string[], delimiter = '|') =>
    cols.join(delimiter);

const generateCsv = (rows: string[][], delimiter = '|') =>
    rows.map((row) => generateCsvRow(row, delimiter)).join('\n');

const router = express.Router();

router.get('/', async (req, res) => {
    const csvCols = [
        'id',
        'title',
        'description',
        'date:year',
        'date:month',
        'date:day',
        'date:hour',
        'date:minute',
        'duration',
        'location',
        'subject',
        'editors',
        'editedAt',
        'classId',
    ] as const;
    const csvRows: string[][] = [[...csvCols]];

    const events = (await eventsCollection.find({}).toArray()).map((e) => {
        let { _id, date, class: classId } = e;
        let { year, month, day, hour, minute } = date;

        return {
            ...e,
            id: _id,
            'date:year': year,
            'date:month': month,
            'date:day': day,
            'date:hour': hour,
            'date:minute': minute,
            classId,
        };
    });

    events.forEach((e) => {
        let csvRowCols: string[] = [];
        csvCols.forEach((col) => {
            let string = '';
            const base = e[col];
            if (Array.isArray(base)) string = base.join(',');
            else if (base === null || base === undefined) string = '';
            else string = base + '';

            csvRowCols.push(string);
        });
        csvRows.push(csvRowCols);
    });

    res.setHeader('Content-Type', 'text/csv');
    res.send(generateCsv(csvRows, (req.query.delimiter as string) || '|'));
});

export default router;
