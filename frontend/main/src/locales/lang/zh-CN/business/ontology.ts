export default {
  ontology: '本体',
  scenario: 'Scenario Search',
  // 空列表
  emptyOntology: 'Empty Ontology',
  emptyClass: '空类别',
  emptyClassification: '空分类',
  // 新建 ontology
  createHolder: '输入名称…',
  maxLength: '字符长度不应超过 256。',
  createOntology: '创建本体',
  ontologyName: '本体名称',
  ontologyType: '本体类型',
  successCreated: '成功创建',
  duplicate: '重复的本体名称',
  noOntologyName: '请输入名称',
  // 删除 ontology
  deleteOntology: '删除本体',
  hasBeenDeleted: '已经被删除',
  deletePlace: '输入本体名称…',
  sure: '你确定要删除本体吗',
  removed: '所有类别和分类都将被删除。',
  verify: '请输入本体名称进行双重验证。',
  // 重命名 ontology
  renameOntology: '重命名本体',
  newName: '新名字',
  hasBeenRenamed: '已更名',
  hasExist: '已经存在。 请重命名。',
  // 搜索字段
  sort: {
    name: '名称',
    creationTime: '创建时间',
  },
  // 卡片列表
  card: {
    classesCount: '分类数量',
    type: '类型',
    createdTime: '创建时间',
  },
  // 弹窗内部的文字
  modal: {
    treeGraph: '树形图',
    basicInfo: '基本信息',
    attributeName: '属性名称',
    optionName: '选项名称',
    inputType: '输入类型',
    required: '必需的',
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
    defaultHeight: '默认高度',
    minHeight: '最小高度',
    minPoints: '最低点',
    // 校验 class|classification
    nameRequired: '姓名必填',
    alreadyExits: '已经存在。',
    enterNewName: '请输入新名称。',
    datasetType: {
      image: '图像',
      lidar: '点云',
      lidarBasic: '激光雷达基础',
      lidarFusion: '激光雷达融合',
    },
    toolType: {
      boundingBox: '边界框',
      polygon: '多边形',
      polyline: '折线',
      keyPoint: '关键点',
      cuboid: '长方体',
    },
    // 取消弹窗
    discard: '丢弃',
    discardChanges: '放弃更改',
    sureDiscard: '您确定要放弃更改吗？',
    // options 校验
    optionsRequired: '选项必填',
    optionValid: '您确定要放弃更改吗？',
    optionValidFilled: '必填字段尚未全部填写。',
    optionValidDiscard: '你确定要放弃这个属性和它的选项吗？',
    // 标准框校验信息
    standardValidateMax: 'Max should be larger than min',
    standardValidateMin: 'Min should be smaller than max',
  },
  // 搜索表单
  searchForm: {
    search: '搜索',
    searchItems: 'Search items by name…',
    sort: '排序',
    filter: '筛选',
    createdDate: '创建日期',
    datasetType: '数据集类型',
    toolType: '工具类型',
  },
  // 复制
  copy: {
    copyFrom: '复制自',
    next: '下一个',
    inputToSearch: '输入搜索',
    copyClass: '从本体中心复制类别',
    copyClassification: '从本体中心复制分类',
    copyPlaceholder: '目前没有同类型的本体可以选择，请先去',
    copyOntologyCenter: '本体中心',
    copyToCreate: '创建',
  },
  sync: {
    saveToOntology: '保存到本体中心',
    selectOntology: '选择要保存到的本体',
    noOntology: '目前没有同类型的本体可以选择，你可以在下方快速创建',
    createAndSync: '创建并同步',
    successCreated: '成功创建并同步',
  },
};
