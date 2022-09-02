import { RuleObject } from 'ant-design-vue/es/form/interface';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

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

export const validateUrl = async (_rule: RuleObject, value: string) => {
  const newValue = value.trim();
  // URL校验正则
  const urlRegex =
    /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;

  // zip校验
  const zipRegex = /\.zip/;

  if (!urlRegex.test(newValue)) {
    // 校验 url
    const verifyText = 'Please input a valid URL';
    return Promise.reject(verifyText);
  } else if (zipRegex.test(newValue)) {
    // 校验 zip
    const verifyText = t('business.datasetContent.uploadModel.validUrl');
    return Promise.resolve(verifyText);
  } else {
    // 校验 其它文件
    const verifyText =
      t('business.datasetContent.uploadModel.invalidUrl') +
      t('business.datasetContent.uploadModel.supported');
    return Promise.reject(verifyText);
  }

  // else {
  //   // 其它情况
  //   // const verifyText = t('business.datasetContent.uploadModel.invalidUrl');
  //   const verifyText = 'Please input a valid URL';
  //   return Promise.reject(verifyText);
  // }
};
