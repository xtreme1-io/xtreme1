export default class BSError {
  code: string;
  message: string;
  oriError: any;
  constructor(code?: string, message?: string, oriError?: any) {
    this.code = code || '';
    this.message = message || '';
    this.oriError = oriError;
  }
}
