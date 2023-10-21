import express from 'express';
import formatXml from 'xml-formatter';
import { generateXml } from './generateXml';

const router = express.Router();

router.get('/', async (req, res) => {
    const xml = await generateXml();

    res.set('Content-Type', 'text/xml');
    res.send(formatXml(xml));
});

export default router;
