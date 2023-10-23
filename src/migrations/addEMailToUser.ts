import { usersCollection } from '../database/user/user';

usersCollection.updateMany({}, { $set: { email: null } });
usersCollection.createIndex({ email: 1 });
