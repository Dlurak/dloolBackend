import express from 'express';

const router = express.Router();

interface Date {
    year: number;
    month: number;
    day: number;
}

router.post('/', (req, res) => {
    const body = req.body;
    let buildHomework: any = {};

    // check that body has assignments
    const { from, assignments, className } = body;
    if (!from || !assignments || !className) {
        res.status(400).json({
            status: 'error',
            message: 'Missing required fields',
        });
        return;
    }

    if (!isDateValid(from)) {
        res.status(400).json({
            status: 'error',
            message: 'Invalid from date',
        });
        return;
    }

    buildHomework = {
        from: sortDate(from),
        assignments: [],
    }


    if (!Array.isArray(assignments)) {
        res.status(400).json({
            status: 'error',
            message: 'Assignments must be of type array',
        });
        return;
    } else if (assignments.length === 0) {
        res.status(400).json({
            status: 'error',
            message: 'Assignments must not be empty',
        });
        return;
    }


    let assignmentIndex = 0;
    for (const assignment of assignments) {
        // check for subject: string description: string and due: some format as from but it must not be the same date as from
        const { subject, description, due } = assignment;
        
        if (!subject || !description || !due) {
            res.status(400).json({
                status: 'error',
                message: `Missing required fields for assignment ${assignmentIndex}`,
            });
            return;
        }

        if (
            typeof subject !== 'string' ||
            typeof description !== 'string'
        ) {
            res.status(400).json({
                status: 'error',
                message: `Invalid fields for assignment ${assignmentIndex}`,
            });
            return;
        }

        if (!isDateValid(due)) {
            res.status(400).json({
                status: 'error',
                message: `Invalid due date for assignment ${assignmentIndex}`,
            });
            return;
        }

        const newAssignment = {
            subject,
            description,
            due: sortDate(due),
        }


        buildHomework.assignments.push(newAssignment);

        assignmentIndex++;
    }

    // BASIC VALIDATION DONE
});


function isDateValid(date: Date) {
    const { year, month, day } = date;

    if (
        typeof year !== 'number' ||
        typeof month !== 'number' ||
        typeof day !== 'number'
    ) {
        return false;
    }

    if (month < 1 || month > 12) {
        return false;
    }

    if (day < 1 || day > 31) {
        return false;
    }

    return true;
}

function sortDate(date: Date) {
    const { year, month, day } = date;

    return {
        year,
        month,
        day,
    }
}


export default router;
