import axios from "axios";
import sizeOf from "buffer-image-size";

export const getImageBufferFromUrl = async (
  url: string,
  { format }: { format: BufferEncoding } = { format: "base64" }
) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data, format);
  const dimensions = sizeOf(imageBuffer);
  return { imageBuffer, ...dimensions };
};

export const scaleImageToMaxWidth = (image: Buffer, maxWidth: number) => {
  const imageWidth = Math.min(sizeOf(image).width, maxWidth);
  const imageHeight = sizeOf(image).height * (imageWidth / sizeOf(image).width);

  return { imageWidth, imageHeight };
};
