import { WithId } from 'mongodb';
import {
    findUniqueSchool,
    findUniqueSchoolById,
} from '../../database/school/findSchool';
import { getUniqueClassById } from '../../database/classes/findClass';
import express from 'express';
import { School } from '../../database/school/school';
import { Class } from '../../database/classes/class';
import { createClass } from '../../database/classes/createClass';

const router = express.Router();

router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields = {
        name: 'string',
        school: 'string',
    };

    for (const entry of Object.entries(requiredFields)) {
        const key = entry[0];
        const value = entry[1];

        if (typeof body[key] !== value) {
            return res.status(400).json({
                status: 'error',
                error: `Missing required field: ${key} of type ${value}`,
            });
        }
    }

    // check that body.name is not empty
    if (body.name.trim() === '') {
        res.status(400).json({
            status: 'error',
            error: "Name can't be empty",
        });
        return;
    }

    const school = await findUniqueSchool(body.school);
    if (!school) {
        res.status(400).json({
            status: 'error',
            error: `School ${body.school} doesn't exist`,
        });
        return;
    }

    const schoolClasses = (school as WithId<School>).classes;
    for (const classId of schoolClasses) {
        const class_ = await getUniqueClassById(classId);
        if (class_?.name === body.name) {
            res.status(400).json({
                status: 'error',
                error: `Class ${body.name} already exists in school ${body.school}`,
            });
            return;
        }
    }

    const schoolId = (school as WithId<School>)._id;

    const newClass: Class = {
        name: body.name,
        school: schoolId,
        members: [],
    };

    const success = await createClass(newClass);
    if (success) {
        res.status(201).json({
            status: 'success',
            message: `New class ${body.name} created`,
            data: newClass,
        });
        return;
    } else {
        res.status(500).json({
            status: 'error',
            error: 'Failed to create class',
        });
        return;
    }
});

export default router;
