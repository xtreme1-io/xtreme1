export default {
  url: 'URL',
  data: 'Data',
  objects: 'Objects',
  dashboard: 'Dashboard',
  autoTag: 'AutoTag',
  upload: 'Upload',
  open: 'Open',
  selectItemsCount: 'items selected',
  selectAll: 'Select All',
  unSelectAll: 'Unselect All',
  assign: 'Assign',
  changeStatus: 'Change Status',
  delete: 'Delete',
  more: 'More',
  localData: 'Local Data',
  objectStorage: 'Object Storage',

  uploadLocalData: 'Upload Local Data',
  uploadPlaceholder:
    'Click to select files or drag and drop file here… Current dataset is an image dataset. zip, gzip, tar formats are supported.',
  uploadImagePlaceholder:
    'Click to select files or drag and drop files here. Supported file types: jpg, jpeg, png, zip',

  uploadingItems: 'items uploading...',
  uploadedItems: 'items uploaded successfully',
  uploadData: 'Upload Data',
  cancelUpload: 'Cancel Upload',
  continueUpload: 'continue Upload',

  terminateUpload: 'Terminate Upload',
  terminateExport: 'Terminate Export',
  terminate: 'Terminate',
  terminateUploadPlaceholder: 'Are you sure you want to terminate upload process?',
  terminateExportPlaceholder: 'Are you sure you want to terminate the export process？',

  process: {
    uploading: 'Uploading: ',
    exporting: 'Exporting: ',
    finished: 'Finished: ',
    item: ' item',
    items: ' items',
    upload: ' upload',
    uploads: ' uploads',
    export: ' export',
    exports: ' exports',
    complete: ' complete',
    ready: ' ready',
    invalidFormat: 'Invalid Format',
  },

  uploadModel: {
    // 0
    and: 'and',
    uploadResult: ' how to upload data with results.',
    // 1
    uploadLocalData: 'Upload Local Data',
    clickText: 'Click to select files ',
    dragText: 'or drag and drop file here ',
    compressedFiles: 'Only compressed file (zip, gzip, tar)',
    widthText: 'with',
    formatText: ' supported 3D format ',
    widthSupported: ' are supported.',
    checkText: 'Check documentation for',
    checkImageText: 'Check documentation for supported data format ',
    supportedTypes: 'Supported file types:',
    imageTypes: 'jpg, jpeg, png, zip',
    limitUploadLocal:
      'There is a file size limit of 500 mb. For larger files, URL or Object Storage uploads are recommended.',
    // 2
    uploadByUrl: '通过链接上传',
    validUrl: '有效的URL',
    invalidUrl: '无效的URL',
    supported: ': only zip file is supported',
    provide: 'Please provide the URL to help us access the compressed zip file',
    generateUrl:
      'How to generate the URL? please check out your cloud service. For more details, please check',
    generateText: ' Amazon guide, Azure guide and Google Cloud guide.',
    connect: 'Connect',
    finish: 'Finish',
    // 3
    minIOBucket: 'MinIO Bucket',
    uploadMinIO:
      '1. Please upload your compressed zip file to our MinIO Bucket via following info:',
    specifyMinIO: '2. Please specify your path in the Minio Bucket',
    endPoint: 'Endpoint',
    accessKey: 'AccessKey:',
    secretKey: 'SecretKey:',
    path: 'Path',
    validPath: '有效的Path',
    invalidPath: '无效的Path',
    tipsUse: 'You can use ',
    cyberduck: 'Cyberduck ',
    tipsOr: 'or your code to upload. For more details, please check ',
    minioGuides: 'Minio Guides',
  },

  sort: {
    itemName: '名字',
    createDate: '创建时间',
    annotateCount: '标注数量',
    updateDate: '修改时间',
  },
  singleData: '单个数据',
  frame: '连续帧',
  frameAction: {
    frame: '合成连续帧',
    frameMultiple: '合成多个连续帧',
    unFrame: '拆分连续帧',
    merge: '合并连续帧',
    moveOut: '移出连续帧',
  },
  modalTitle: {
    merge: '合并连续帧到',
    frameMultiple: '创建多个连续帧',
    minio: 'MinIO Bucket',
    url: '通过链接上传',
  },
  tips: {
    mergeTips: '合并当前数据到',
    frameMultipleTipsBefore: '创建连续帧每',
    frameMultipleTipsAfter: '个',
  },

  urlError: '请输入一个包含压缩包类型的地址',
  splitModel: {
    title: 'Split Dataset',
  },
  unLock: {
    tips: '一旦你强制解锁选中的占用者，他们将无法更改这些数据，除非他们重新认领。所有未保存的更改将被丢弃。',
    totalSelect: '已选占用数据总数',
    searchPlaceholder: '按占用者姓名搜索',
    // TODO:
    forceUnlock: '强制解锁',
  },
};
