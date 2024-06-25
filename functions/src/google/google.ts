import vision from "@google-cloud/vision";
import {makeGCVisionRequestFromBase64} from "../utils";

export default (image: string) => {
  return new Promise( async (resolve, reject) => {
    try {
      // Creates a client
      const client = new vision.ImageAnnotatorClient({
        keyFile: `${process.cwd()}/src/google/gcloud-api.json`,
      });
      // const fileName = `${process.cwd()}/assets/text-custom-font.png`;
      const request = makeGCVisionRequestFromBase64(image);
      const [result] = await client.textDetection(request);
      const detections: any = result.textAnnotations;
      const finalText = detections[0].description.replace(/\r/g, "\\\\r");
      resolve(finalText);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
