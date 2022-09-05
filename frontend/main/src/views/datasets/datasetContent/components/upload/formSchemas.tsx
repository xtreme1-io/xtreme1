import { RuleObject } from 'ant-design-vue/es/form/interface';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

/** validate compress */
const zipRegex = '(.zip)';
const reZip = new RegExp(zipRegex);
export const verifyCompress = (value: string): boolean => {
  return !!reZip.test(value.toLowerCase());
};

/** validate image */
const imageRegex = '(.jpg|.png|.jpeg)';
const reImage = new RegExp(imageRegex);
export const verifyImage = (value: string): boolean => {
  return !!reImage.test(value.toLowerCase());
};

export const validateUrl = async (_rule: RuleObject, value: string) => {
  const newValue = value.trim();

  const urlRegex =
    /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;

  const zipRegex = /\.zip/;

  if (!urlRegex.test(newValue)) {
    const verifyText = 'Please input a valid URL';
    return Promise.reject(verifyText);
  } else if (zipRegex.test(newValue)) {
    const verifyText = t('business.datasetContent.uploadModel.validUrl');
    return Promise.resolve(verifyText);
  } else {
    const verifyText =
      t('business.datasetContent.uploadModel.invalidUrl') +
      t('business.datasetContent.uploadModel.supported');
    return Promise.reject(verifyText);
  }
};
