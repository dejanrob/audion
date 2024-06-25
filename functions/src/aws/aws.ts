import * as AWS from "aws-sdk";
import {makeBinaryFromBase64} from "../utils";
import {awsConfig as env} from "../config";

export default (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const bytesImage = makeBinaryFromBase64(base64Image);

      const config = new AWS.Config({
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        region: env.REGION,
      });

      AWS.config.update(config);
      const client = new AWS.Rekognition();
      const params = {
        Image: {
          Bytes: bytesImage,
        },
      };

      let finalText = "";
      client.detectText(params, function(error, response) {
        if (error) {
          // console.log(err, err.stack); // handle error if an error occurred
          reject(error);
        } else {
          response.TextDetections?.forEach((label) => {
            finalText+=`${label.DetectedText} `;
          });
          resolve(finalText);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
