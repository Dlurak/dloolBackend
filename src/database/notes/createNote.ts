import { WithId } from 'mongodb';
import { Note, noteCollection } from './notes';

export function createNote(note: Note) {
    note.createdAt = Date.now();

    return noteCollection
        .insertOne(note)
        .then((value) => {
            return { ...note, _id: value.insertedId } as WithId<Note>;
        })
        .catch(() => null);
}
