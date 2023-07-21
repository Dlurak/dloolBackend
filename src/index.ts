import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.public' });

const app = express();

app.all('/', (req, res) => {
    res.status(400).json({
        status: 'error',
        message: "This route isn't defined",
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
