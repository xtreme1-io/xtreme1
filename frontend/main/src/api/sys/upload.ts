import { UploadApiResult } from './model/uploadModel';
import { defHttp } from '/@/utils/http/axios';
import { UploadFileParams } from '/#/axios';
// import { useGlobSetting } from '/@/hooks/setting';

// const { uploadUrl = '' } = useGlobSetting();
const uploadUrl = '/api/storage/storage/uploadFile';
const uploadPresignedUrl = '/storage/storage/generatePresignedUrl';

/**
 * @description: Upload interface
 */
export function uploadApi(
  params: UploadFileParams,
  onUploadProgress?: (progressEvent: any) => void,
  cancelToken?: any,
) {
  return defHttp.uploadFile<UploadApiResult>(
    {
      url: uploadUrl,
      onUploadProgress: onUploadProgress,
      cancelToken: cancelToken,
    },
    params,
  );
}

export function uploadPresignedFile(params: any) {
  return defHttp.get<any>({
    url: uploadPresignedUrl,
    params,
  });
}
