/**
 * @description: Request result set
 */
export enum ResultEnum {
  SUCCESS = 'OK',
  ERROR = 1,
  TIMEOUT = 401,
  TYPE = 'success',
  USER__TEAM__NOT_EXIST = 'USER__TEAM__NOT_EXIST',
  USER__TEAM__NOT_HAVE_USER = 'USER__TEAM__NOT_HAVE_USER',
  USER__LOGIN_STATUS_TIMEOUT = 'USER__LOGIN_STATUS_TIMEOUT',
  DATASET_DATA_EXIST_ANNOTATE = 'DATASET_DATA_EXIST_ANNOTATE',
}

/**
 * @description: request method
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

/**
 * @description:  contentTyp
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
}
