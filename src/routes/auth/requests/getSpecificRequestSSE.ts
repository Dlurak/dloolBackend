import express from 'express';
import { ObjectId, WithId } from 'mongodb';
import { findSpecificRequestById } from '../../../database/requests/findAddToClassRequests';
import {
    AddToClassRequest,
    addToClassRequestsCollection,
} from '../../../database/requests/addToClassRequests';

const parseSignupRequest = (document: WithId<AddToClassRequest>) => ({
    userDetails: {
        name: document.userDetails.name,
        username: document.userDetails.username,
        createdAt: document.userDetails.createdAt,
        school: document.userDetails.school,
        acceptedClasses: document.userDetails.acceptedClasses,
    },
    classId: document.classId,
    createdAt: document.createdAt,
    status: document.status,
    processedBy: document.processedBy,
});

const router = express.Router();

router.get('/:id/sse', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!ObjectId.isValid(req.params.id)) {
        res.write('event: error\n');
        res.write('data: Invalid id\n\n');
        res.end();
        return;
    }

    const document = await findSpecificRequestById(new ObjectId(req.params.id));

    if (!document) {
        res.write('event: error\n');
        res.write('data: Request not found\n\n');
        res.end();
        return;
    }

    res.write(`data: ${JSON.stringify(parseSignupRequest(document))}\n\n`);

    const changeStream = addToClassRequestsCollection.watch([
        { $match: { 'documentKey._id': document._id } },
    ]);

    changeStream.on('change', async () => {
        const document = (await findSpecificRequestById(
            new ObjectId(req.params.id),
        )) as WithId<AddToClassRequest>;
        res.write(`data: ${JSON.stringify(parseSignupRequest(document))}\n\n`);

        if (document.status === 'accepted' || document.status === 'rejected') {
            res.end();
            changeStream.close();
            return;
        }
    });
});

export default router;
