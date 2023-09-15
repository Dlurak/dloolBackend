import express from 'express';
import { ObjectId, WithId } from 'mongodb';
import { findUserById } from '../../database/user/findUser';
import { getUniqueClassById } from '../../database/classes/findClass';
import { Class } from '../../database/classes/class';
import { findUniqueSchoolById } from '../../database/school/findSchool';
import { SchoolWithId } from '../../database/school/school';

const router = express.Router();

/**
 * @api {get} /auth/user/:id Get user details
 * @apiName GetUserDetails
 * @apiGroup Auth
 *
 * @apiParam {String} id The MongoDB ID of the user
 *
 * @apiSuccess (200) {String=Success} status Status of the request.
 * @apiSuccess (200) {String="User details"} message Message of the request.
 * @apiSuccess (200) {Object} data Data of the request.
 * @apiSuccess (200) {Object} data.user The user object.
 * @apiSuccess (200) {String} data.user._id The MongoDB ID of the user.
 * @apiSuccess (200) {String} data.user.name The name of the user.
 * @apiSuccess (200) {String} data.user.school The name of the school the user is in.
 * @apiSuccess (200) {String[]} data.user.classes The names of the classes the user is in.
 *
 *
 * @apiError (400) {String=error} status Status of the request.
 * @apiError (400) {String="Invalid user ID"} message Error message.
 *
 * @apiError (404) {String=error} status Status of the request.
 * @apiError (404) {String="User not found"} message Error message.
 */
router.get('/:id', async (req, res) => {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        res.status(400).json({
            status: 'error',
            message: 'Invalid user ID',
        });
        return;
    }

    const user = await findUserById(new ObjectId(id));

    if (!user) {
        res.status(404).json({
            status: 'error',
            message: 'User not found',
        });
        return;
    }

    const { _id, name, school, classes } = user;

    const schoolId = new ObjectId(school);
    const classIds = classes.map((classId) => new ObjectId(classId));

    const classNames = await Promise.all(
        classIds.map(async (classId) => {
            const class_ = (await getUniqueClassById(classId)) as WithId<Class>;
            return class_.name;
        }),
    );
    const schoolName = (await findUniqueSchoolById(schoolId)) as SchoolWithId;

    const resUser = {
        _id,
        name,
        school: schoolName.name,
        classes: classNames,
    };

    res.status(200).json({
        status: 'success',
        message: 'User details',
        data: {
            user: resUser,
        },
    });
});

export default router;
