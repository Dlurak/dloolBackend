import { CalEvent, eventsCollection } from './event';

export function createEvent(event: CalEvent) {
    event.editedAt = [Date.now()];

    return eventsCollection.insertOne(event);
}
