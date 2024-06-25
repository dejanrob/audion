import express from 'express';
const app = express.Router();
import cors from 'cors';
import { readTheBook, ocrImage } from './controllers';

app.use(cors());

app.post('/ocr', cors(), ocrImage);
app.post('/read', cors(), readTheBook);

export default app;