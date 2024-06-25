import * as functions from "firebase-functions";
import express from 'express';
import router from './routes';
const app = express();

app.use(express.json({limit: '50mb'}));
app.use('/', router);

app.listen(3000, () => console.log("started on 3000"));

// export const ocrImage = functions.https.onRequest(app);
