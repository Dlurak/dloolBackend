import express from 'express';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: '.env.public' });

const app = express();

app.use(express.static(path.join(__dirname, '../docs')));

app.use((req, res, next) => {
    res.status(404).send('Sorry cant find that!');
});

const port = process.env.PORT_DOC || 3001;

app.listen(port, () => {
    console.log(`Documentation server listening at http://localhost:${port}`);
});
