export default {
  ontology: 'Ontology',
  scenario: 'Scenario Search',
  // 空列表
  emptyOntology: 'Empty Ontology',
  emptyClass: 'Empty Classes',
  emptyClassification: 'Empty Classification',
  // 新建 ontology
  createHolder: 'Input name…',
  maxLength: 'Character length should be no more than 256.',
  createOntology: 'Create Ontology',
  ontologyName: 'Ontology Name',
  ontologyType: 'Ontology Type',
  successCreated: 'Successfully Created',
  duplicate: 'Duplicate ontology name',
  noOntologyName: 'Please input name',
  // 删除 ontology
  deleteOntology: 'Delete Ontology',
  hasBeenDeleted: 'has been deleted',
  deletePlace: 'Enter ontology name here…',
  sure: 'Are you sure to delete ontology',
  removed: 'All class and classifications will be removed. ',
  verify: 'Please enter ontology name to do double-verification.',
  // 重命名 ontology
  renameOntology: 'Rename Ontology',
  newName: 'New Name',
  hasBeenRenamed: 'has been renamed',
  hasExist: ' already exist. Please rename.',
  // 搜索字段
  sort: {
    name: 'Item Name',
    creationTime: 'Created Date',
  },
  // 卡片列表
  card: {
    classesCount: 'Classes Count',
    type: 'Type',
    createdTime: 'Created Time',
  },
  // 弹窗内部的文字
  modal: {
    treeGraph: 'Tree Graph',
    basicInfo: 'Basic Info',
    attributeName: 'Attribute Name',
    optionName: 'Option Name',
    inputType: 'Input Type',
    required: 'Required',
    constraints: {
      constraints: 'constraints',
      standard: 'Standard',
      length: 'Length',
      width: 'Width',
      height: 'Height',
      points: 'Points',
      unitStandard: 'm',
      size: 'Size',
      area: 'Area',
      unitImage: 'px',
    },
    defaultHeight: 'Default Height',
    minHeight: 'Min Height',
    minPoints: 'Min Points',
    // 校验 class|classification
    nameRequired: 'Name Required',
    alreadyExits: ' already exist.',
    enterNewName: 'Please enter a new name.',
    datasetType: {
      image: 'Image',
      lidar: 'Lidar',
      lidarBasic: 'Lidar Basic',
      lidarFusion: 'Lidar Fusion',
    },
    toolType: {
      boundingBox: 'Bounding Box',
      polygon: 'Polygon',
      polyline: 'Polyline',
      keyPoint: 'Key Point',
      cuboid: 'Cuboid',
    },
    // 取消弹窗
    discard: 'Discard',
    discardChanges: 'Discard Changes',
    sureDiscard: 'Are you sure to discard the changes?',
    // options 校验
    optionsRequired: 'Options Required',
    optionValid: 'Are you sure to discard the changes?',
    optionValidFilled: 'Required fields have not been all filled. ',
    optionValidDiscard: "Are you sure to discard this attribute and it's options?",
    // 标准框校验信息
    standardValidateMax: 'Max should be larger than min',
    standardValidateMin: 'Min should be smaller than max',
  },
  // 搜索表单
  searchForm: {
    search: 'Search',
    searchItems: 'Search items by name…',
    sort: 'Sort',
    filter: 'Filter',
    createdDate: 'Created Date',
    datasetType: 'Dataset type',
    toolType: 'Tool type',
  },
  // 复制
  copy: {
    copyFrom: 'Copy From',
    next: 'Next',
    inputToSearch: 'Input to search',
    copyClass: 'Copy Class from Ontology Center',
    copyClassification: 'Copy Classification from Ontology Center',
    copyPlaceholder: 'There is no ontology of this dataset type available. You can go to ',
    copyOntologyCenter: 'Ontology Center ',
    copyToCreate: 'to create a new one.',
  },
  sync: {
    saveToOntology: 'Save to Ontology Center',
    selectOntology: 'Select an ontology to save into',
    noOntology: 'There is no ontology of this dataset type available. Please create a new one.',
    createAndSync: 'Create And Sync',
    successCreated: 'Successfully created and synchronized',
  },
};
