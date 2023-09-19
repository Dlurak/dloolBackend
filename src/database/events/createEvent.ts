import { CalEvent, eventsCollection } from './event';

export function createEvent(event: CalEvent) {
    event.editedAd = [Date.now()];

    return eventsCollection.insertOne(event);
}
