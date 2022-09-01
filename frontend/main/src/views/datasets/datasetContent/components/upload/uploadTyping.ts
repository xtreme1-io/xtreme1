import { UploadApiResult } from '/@/api/sys/model/uploadModel';
import { UploadResultStatus } from '/@/components/Upload/src/typing';

export interface FileItem {
  name: string;
  size: string | number;
  type?: string;
  percent: number;
  file: File;
  status?: UploadResultStatus;
  responseData?: UploadApiResult;
  uuid: string;
  error?: string;
  controller?: any;
}
export interface FileInfo {
  file: FileItem;
  fileList: FileItem[];
}
