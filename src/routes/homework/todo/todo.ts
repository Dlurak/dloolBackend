import express from 'express';
import { classesCollection } from '../../../database/classes/class';
import { findUniqueSchool } from '../../../database/school/findSchool';
import { getHomeworkForMultipleClasses } from '../../../database/homework/findHomework';
import { ObjectId } from 'mongodb';
import { getUniqueClassById } from '../../../database/classes/findClass';

const router = express.Router();

/**
 * @api {get} /homework/todo/:school Get homework todo for a school
 * @apiName GetHomeworkTodo
 * @apiGroup Homework
 * @apiDescription Get a todo list with all homework for a school in todo.txt format. IT IS NOT JSON!!!
 * 
 * @apiParam {String} school The unique name of the school to get the todo list for
 * @apiQuery {String[]} classes A comma separated list of classes to get the todo list for
 * 
 * @apiSuccess (200) {String} text The todo list, in text/plain format <b>NOTE THAT THIS IS NOT JSON!!!</b>
 * 
 * @apiError (404) {String} status The status of the response
 * @apiError (404) {String} message The error message
 *
 * @apiErrorExample {json} 404 - School not found:
 *   HTTP/1.1 404 Not Found
 *   {
 *     "status": "error",
 *     "message": "School not found"
 *  }
 * @apiErrorExample {json} 404 - No classes found:
 *   HTTP/1.1 404 Not Found
 *   {
 *     "status": "error",
 *     "message": "No classes found"
 *   }
 */
router.get('/todo/:school', async (req, res) => {
    const school = req.params.school;
    const rawClasses = req.query.classes;
    const classes = rawClasses ? (rawClasses as string).split(',') : [];

    const schoolObj = await findUniqueSchool(school);

    if (!schoolObj) {
        return res.status(404).json({
            status: 'error',
            message: 'School not found',
        });
    }

    const classIdsPromises = classes.map((className: string) => {
        const class_ = classesCollection
            .findOne({ name: className, school: schoolObj._id })
            .then((class_) => class_?._id ?? null);
        return class_;
    });

    const classIds = (await Promise.all(classIdsPromises)).filter(
        (id) => id !== null,
    );

    if (classIds.length === 0) {
        return res.status(404).json({
            status: 'error',
            message: 'No classes found',
        });
    }

    const homework = await getHomeworkForMultipleClasses(
        classIds as ObjectId[],
    );

    const todos: any[] = homework.map(async (hw) => {
        let todo: string[] = [];
        const creationDate = `${hw.from.year}-${hw.from.month}-${hw.from.day}`;
        const className = (await getUniqueClassById(hw.class))?.name;
        hw.assignments.forEach((assignment) => {
            const dueDate = `${assignment.due.year}-${assignment.due.month}-${assignment.due.day}`;
            const project = `+${className} +${assignment.subject}`;
            const description = assignment.description;
            const todoAssignment = `${creationDate} ${description} ${project} due:${dueDate}`;
            todo.push(todoAssignment);
        });
        return todo;
    });
    const todosResolved = await Promise.all(todos);
    const todosFlattened = todosResolved.flat();
    const todosString = todosFlattened.join('\n');

    res.set('Content-Type', 'text/plain');
    res.status(200);
    res.send(todosString);
});

export default router;
