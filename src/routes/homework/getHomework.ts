import { findUniqueSchool } from '../../database/school/findSchool';
import { findClass } from '../../database/classes/findClass';
import express from 'express';
import { getHomeworkByClass } from '../../database/homework/findHomework';

const router = express.Router();

router.get('/', async (req, res) => {
    const className = req.query.class;
    const schoolName = req.query.school;

    // the uri can look like that: /homework?class=5a&school=Hogwarts
    
    if (!className) {
        res.status(400).json({
            status: "error",
            error: 'No class was given',
        });
        return;
    } else if (!schoolName) {
        res.status(400).json({
            status: "error",
            error: 'No school was given',
        });
        return;
    }

    const school = await findUniqueSchool(schoolName as string)
    if (!school) {
        res.status(400).json({
            status: "error",
            error: `The school ${schoolName} does not exist`,
        });
        return;
    }
    
    const classObj = await findClass(school, className as string);

    console.log(classObj);

    if (!classObj) {
        res.status(400).json({
            status: "error",
            error: `The class ${className} does not exist in the school ${schoolName}`,
        });
        return;
    }

    const homework = await getHomeworkByClass(classObj._id);

    res.status(200).json({
        status: "success",
        message: "Homework found",
        data: homework,
    });
});

export default router;
