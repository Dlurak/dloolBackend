import { ObjectId } from 'mongodb';
import { DateTime } from '../../types/date';
import { db } from '../database';

export const eventsCollection = db.collection<CalEvent>('events');

export interface CalEvent {
    title: string;
    description: string;

    date: DateTime;

    duration: number;
    location: string | null;
    subject: string;

    editors: ObjectId[];
    editedAd: number[];

    class: ObjectId;
}
