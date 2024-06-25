export const makeBinaryFromBase64 = (base64image: string) => {
  const image = Buffer.from(base64image, "base64").toString("binary");
  const length = image.length;
  const imageBytes = new ArrayBuffer(length);
  const ua = new Uint8Array(imageBytes);
  for (let i = 0; i < length; i++) {
    ua[i] = image.charCodeAt(i);
  }
  return ua;
};

export const makeGCVisionRequestFromBase64 = (base64image: string) => {
  return {
    image: {
      content: Buffer.from(base64image, "base64"),
    },
  };
};
