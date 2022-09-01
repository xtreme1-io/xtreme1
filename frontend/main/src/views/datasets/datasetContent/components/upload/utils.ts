/** 校验压缩包格式 */
const zipRegex = '(.zip)';
const reZip = new RegExp(zipRegex);
export const verifyCompress = (value: string): boolean => {
  return !!reZip.test(value.toLowerCase());
};

/** 校验图片格式 */
const imageRegex = '(.jpg|.png|.jpeg)';
const reImage = new RegExp(imageRegex);
export const verifyImage = (value: string): boolean => {
  return !!reImage.test(value.toLowerCase());
};
