import { openWindow } from '..';
import { dataURLtoBlob, urlToBase64 } from './base64Conver';

/**
 * Download online pictures
 * @param url
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByOnlineUrl(url: string, filename: string, mime?: string, bom?: BlobPart) {
  urlToBase64(url).then((base64) => {
    downloadByBase64(base64, filename, mime, bom);
  });
}

/**
 * Download pictures based on base64
 * @param buf
 * @param filename
 * @param mime
 * @param bom
 */
export function downloadByBase64(buf: string, filename: string, mime?: string, bom?: BlobPart) {
  const base64Buf = dataURLtoBlob(buf);
  downloadByData(base64Buf, filename, mime, bom);
}

/**
 * Download according to the background interface file stream
 * @param {*} data
 * @param {*} filename
 * @param {*} mime
 * @param {*} bom
 */
export function downloadByData(data: BlobPart, filename: string, mime?: string, bom?: BlobPart) {
  const blobData = typeof bom !== 'undefined' ? [bom, data] : [data];
  const blob = new Blob(blobData, { type: mime || 'application/octet-stream' });

  const blobURL = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', filename);
  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank');
  }
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(blobURL);
}

/**
 * Download file according to file address
 * @param {*} sUrl
 */
export function downloadByUrl({
  url,
  target = '_blank',
  fileName,
}: {
  url: string;
  target?: TargetContext;
  fileName?: string;
}): boolean {
  const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return false;
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a');
    link.download = 'download';
    link.href = url;
    link.target = target;

    if (link.download !== undefined) {
      console.log(url);
      link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents');
      e.initEvent('click', true, true);
      link.dispatchEvent(e);
      return true;
    }
  }
  if (url.indexOf('?') === -1) {
    // url += '?response-content-type=application%2Foctet-stream';
  }
  openWindow(url, { target });
  return true;
}

export function downloadByCorsUrl({
  url,
  fileName,
}: {
  url: string;
  target?: TargetContext;
  fileName?: string;
}): boolean {
  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return false;
  }
  // const x = new XMLHttpRequest();
  // x.open('GET', url, true);
  // x.responseType = 'blob';
  // x.onload = function () {
  //   //会创建一个 DOMString，其中包含一个表示参数中给出的对象的URL。这个 URL 的生命周期和创建它的窗口中的 document 绑定。这个新的URL 对象表示指定的 File 对象或 Blob 对象。
  //   const url = window.URL.createObjectURL(x.response);
  //   const a = document.createElement('a');
  // };
  // x.send();
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
  a.target = '_blank';
  a.click();
  return true;
}
