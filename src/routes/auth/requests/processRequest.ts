import express from 'express';
import { ObjectId } from 'mongodb';
import { findSpecificRequestById } from '../../../database/requests/findAddToClassRequests';
import authenticate from '../../../middleware/auth';
import findUsername from '../../../database/user/findUser';
import {
    acceptRequest,
    rejectRequest,
} from '../../../database/requests/changeAddToClassRequestStatus';

const router = express.Router();

router.patch(
    '/:id/:operator(accept|reject)',
    authenticate,
    async (req, res) => {
        const rawId = req.params.id;
        const operator = req.params.operator as 'accept' | 'reject';
        const username = res.locals.jwtPayload.username as string;
        const userObjPromise = findUsername(username);

        if (!ObjectId.isValid(rawId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ID',
            });
        }

        const document = await findSpecificRequestById(new ObjectId(rawId));
        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Request not found',
            });
        }

        if (document.status !== 'pending') {
            return res.status(400).json({
                status: 'error',
                message: 'Request is already processed',
            });
        }

        const userObj = await userObjPromise;
        if (!userObj) {
            return res.status(500).json({
                status: 'error',
                message: 'User not found',
            });
        }
        const userId = userObj._id;
        const userClasses = userObj.classes;

        if (!userClasses.map(String).includes(String(document.classId))) {
            console.log(userClasses, document.classId);
            return res.status(403).json({
                status: 'error',
                message: "You don't have access to this class yourself",
            });
        }

        // VALIDATION PASSED //

        if (operator === 'accept') await acceptRequest(document._id, userId);
        else if (operator === 'reject')
            await rejectRequest(document._id, userId);

        return res.status(200).json({
            status: 'success',
            message: 'Request processed',
        });
    },
);

export default router;
