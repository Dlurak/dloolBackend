import express from 'express';
import { timezoneOffsets } from '../../constant/constants'
import { findUniqueSchool } from '../../database/school/findSchool';
import {createSchool} from '../../database/school/createSchool';

const router = express.Router();

router.post('/', async (req, res) => {
    const body = req.body;

    const requiredFields = {
        name: 'string',
        description: 'string',
        uniqueName: 'string',
        timezoneOffset: 'number',
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

    // check if the timezone offset is valid

    if (!timezoneOffsets.includes(body.timezoneOffset)) {
        return res.status(400).json({
            status: 'error',
            error: `Invalid timezone offset: ${body.timezoneOffset}`,
        });
    }

    // check if the uniqueName is really unique
    let uniqueSchool = await findUniqueSchool(body.uniqueName);

    if (uniqueSchool) {
        return res.status(400).json({
            status: 'error',
            error: `School with unique name ${body.uniqueName} already exists`,
        });
    }

    createSchool({
        name: body.name,
        description: body.description,
        uniqueName: body.uniqueName,
        timezoneOffset: body.timezoneOffset,
        classes: [],
    }).then((success) => {
        if (success) {
            return res.status(201).json({
                status: 'success',
                message: 'School created successfully',
            });
        } else {
            return res.status(500).json({
                status: 'error',
                error: 'Failed to create school',
            });
        }
    }).catch(() => {
        return res.status(500).json({
            status: 'error',
            error: 'Failed to create school',
        });
    });
});

export default router;
