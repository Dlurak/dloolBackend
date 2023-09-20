import express from 'express';
import { jsonAccepter } from '../../middleware/isFormat';

import getAsJsonRouter from './get/json';

const router = express.Router();

router.use('/', jsonAccepter, getAsJsonRouter);

/**
 * @api {get} /events Get events
 * @apiName GetEvents
 * @apiGroup Events
 * @apiDescription Get events sorted by newest to oldest. Can be filtered by school and class and is paginated.
 *    Currently only supports JSON format but with the Accept header, it will support more formats in the future.
 *    Please note that the only documented format is JSON. If you use any other format, it will work but it wont be documented. All of the errors will be in JSON format.
 *
 * @apiQuery {String} [school] Filter events by school. If not both school and class are provided, all events will be returned.
 * @apiQuery {String} [class] Filter events by class. If not both school and class are provided, all events will be returned.
 *
 * @apiHeader {String} [Accept=application/json] The requested format. Currently only JSON is supported. I plan to support iCal very very soon and maybe RSS, CSV and XML in the future.
 *    Please note that the only documented format is JSON. If you use any other format, it will work but it wont be documented. All of the errors will be in JSON format.
 *    If you have an idea how to document other formats, please open an issue on the backend repo on GitHub. ;)
 *
 * @apiError (404) {String="error"} status The status of the request
 * @apiError (404) {String="Class not found"} message The error message. The request must specify both a school and class for this error to occur.
 *
 * @apiSuccess (200) {String="success"} status The status of the request
 * @apiSuccess (200) {Number} pageCount The number of pages
 * @apiSuccess (200) {Object} data The events
 * @apiSuccess (200) {Object[]} data.events The actual events
 * @apiSuccess (200) {String} data.events.title The title of the event
 * @apiSuccess (200) {String} data.events.description The description of the event
 * @apiSuccess (200) {Object} data.events.date The start date of the event
 * @apiSuccess (200) {Number} data.events.date.year The year of the event
 * @apiSuccess (200) {Number{1-12}} data.events.date.month The month of the event
 * @apiSuccess (200) {Number{1-31}} data.events.date.day The day of the event
 * @apiSuccess (200) {Number{0-23}} data.events.date.hour The hour of the event
 * @apiSuccess (200) {Number{0-59}} data.events.date.minute The minute of the event
 * @apiSuccess (200) {Number{0..}} data.events.duration The duration of the event in seconds
 * @apiSuccess (200) {String|Null} data.events.location The location of the event
 * @apiSuccess (200) {String} data.events.subject The subject of the event
 * @apiSuccess (200) {String} data.events.school The unique school name of the event
 * @apiSuccess (200) {String} data.events.class The class name of the event
 * @apiSuccess (200) {String[]} data.events.editors The usernames of the editors of the event
 * @apiSuccess (200) {String[]} data.events.editedAt The timestamps of the edits of the event
 *
 * @apiUse pagination
 */
router.get('/', (req, res) => {
    res.status(406).json({
        status: 'error',
        message: 'Unsupported Accept header',
    });
});

export default router;
