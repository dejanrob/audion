import axios, { AxiosRequestConfig } from "axios";
import {azureConfig} from "../config";

export const OCRImage = (base64Image: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = await azureRequestParsingUrl(base64Image);
      const data = await azureContentProcessing(url);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

const azureRequestParsingUrl = (base64Image: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = {
        method: "post",
        url: `${azureConfig.VISION_ENDPOINT}/vision/v3.2/read/analyze`, // you can use language=bs&readingOrder=natural
        headers: {
          "Ocp-Apim-Subscription-Key": `${azureConfig.VISION_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        data: Buffer.from(base64Image, "base64"),
      };
      
      const {headers} = await axios(config);
      resolve(headers["operation-location"]);
    } catch (error) {
      reject(error);
    }
  });
};

const azureContentProcessing = (url: string) => {
  return new Promise<any>(async (resolve, reject) => {
    try {
      const config = {
        method: "get",
        url,
        headers: {
          "Ocp-Apim-Subscription-Key": `${azureConfig.VISION_API_KEY}`,
          "Content-Type": "application/json",
        },
      };
      
      const int = setInterval(async () => {
        try {
          console.log(new Date());
          const {data} = await axios(config);
          const finalText: string = wrapContent(data);
          if (finalText.length > 0) {
            clearInterval(int);
            resolve(finalText);
          }
        } catch (error) {
          clearInterval(int);
          throw error;
        }
      }, 2500);
    } catch (error) {
      reject(error);
    }
  });
};

const wrapContent = (content: any): string => {
  let finalText: string = '';
  if (content.status == "running") {
    return '';
  }
  if (content.status != "succeeded") {
    throw new Error("We dont have valid response, shutting down.");
  }
  const result: Array<any> = content.analyzeResult.readResults[0].lines;
  result.forEach((element:any) => {
    finalText+=`${element.text} `;
  });
  return finalText;
};
