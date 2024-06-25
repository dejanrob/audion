import axios, { AxiosRequestConfig } from "axios";
import { Request } from "express";
import { OCRImage } from "./azure/azure";
import { azureConfig } from './config';

export const ocrImage = async (req: Request | any, res: Response | any) => {
    let data: any = '';
    let status = 200;
    try {
        // throw new Error('sve radi!!!');
        const { image:base64Image } = req.body;
        data = await OCRImage(base64Image);
    } catch (error: any) {
        status = 400;
        data = error.message;
    } finally {
        res.header({
            'Content-Type':'text/plain'
        }).status(status).send(data);
    }
}

export const readTheBook = async (req: Request | any, res: Response | any) => {
    let finalData = null;
    let status = 200;
    try {
        console.log('Reading process started...');
        const { text, interpreter } = req.body;
        const axiosConfig: AxiosRequestConfig = {
            method: 'post',
            url: `${azureConfig.SPEECH_ENDPOINT}`,
            headers: {
                'Ocp-Apim-Subscription-Key': `${azureConfig.SPEECH_API_KEY}`,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': `${azureConfig.AUDIO_FORMAT}`,
            },
            data: `
            <speak version='1.0' xml:lang='${interpreter.lang}'>
            <voice xml:lang='${interpreter.lang}' xml:gender='${interpreter.gender}' name='${interpreter.voice}'>
                ${text}
            </voice>
            </speak>
            `,
            responseType: 'arraybuffer',
        };
        const { data } = await axios(axiosConfig);
        console.log('Finishing reading process...');
        finalData = Buffer.from(data).toString('base64');
    } catch (error: any) {
        status = 400;
        finalData = error.message;
        console.log(finalData);
    } finally {
        res.status(status).send(finalData)
    }
}