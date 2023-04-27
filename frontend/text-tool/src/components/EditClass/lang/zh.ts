import { ILocale } from './type';

const zh: ILocale = {
    'track-title': '追踪对象',
    'frame-object': '第{{n}}帧对象',
    'mark-all-true': '全标记为人工标注',
    'track-id': '追踪ID',
    'model-info': '模型信息',
    'predict-class': '模型标签',
    'mark-present': '标记为可见',
    'mark-gone': '标记为消失',
    'status-title': '状态',
    'instances-title': '实例',
    'advanced-title': '高级操作',
    'copy-title': '复制',
    'copy-success': '复制成功',
    'no-data': '无数据',
    // class
    'class-title': '标签',
    'class-tip-info':
        '设置该追踪对象为{{type}}，将清空该追踪对象在全部帧中已标注的属性信息，是否确认？',
    'class-tip-info-standard':
        '设置该追踪对象为“{{type}}”，将重写其全部结果的长宽高信息，需要继续么？',
    'class-length': '长',
    'class-width': '宽',
    'class-height': '高',
    'class-points': '点数',
    'class-recent': '最近使用标签',
    'class-other': '其他',
    // type
    'mark-as-standard': '设为标准框',
    'mark-standard': '标准框',
    'mark-no-standard': '取消标准框',
    'object-type': '框类型',
    'type-tip-info': '设置该追踪对象为{{type}}，将重写其全部结果的长宽高信息，需要继续么？',
    // instance
    'rect-title': '4个点',
    'box-title': '8个点',
    'cloud-object': '点云对象',
    'image-object': '图片 {{index}} 对象({{type}})',
    // attributes
    'attributes-title': '属性',
    'attr-copy-from': '复制从',
    'attr-copy-to': '复制去',
    'attr-from-title': '从当前帧中其他对象复制属性',
    'attr-from-object': '追踪对象',
    'attr-to-title': '将当前属性复制到该追踪对象其他帧',
    'attr-to-tip': '(此操作会覆盖原有的属性结果)',
    'attr-to-from': '从{{ n }}帧',
    'attr-to-to': '到{{ n }}帧',
    'attr-from-self': '不能复制自己的属性',
    'attr-from-different-class': '不同标签的属性不能复制',

    // model
    'model-instance': '实例',
    'model-confidence': '置信度',

    // Merge
    'merge-title': '合并',
    'merge-to': '合并到',
    'merge-from': '合并从',
    'marge-target': '目标追踪对象',
    // Split
    'split-title': '拆分',
    'split-btn-title': '从当前帧拆分',
    'split-new-object': '新拆分的对象为',
    'split-new-class': '标签',
    // Delete
    'delete-title': '删除',
    'delete-all': '所有帧',
    'delete-some': '部分帧',
    'delete-no-true': '非人工标注',
    'delete-all-tip': '是否要删除全部帧中的对象？',
    'delete-some-tip': '是否要删除所选帧中的对象？',
    'delete-no-true-tip': '是否删除此追踪对象下所有非人工标注对象？',
    'delete-from': '从{{ n }}帧',
    'delete-to': '到{{ n }}帧',

    // btn
    'btn-title-cancel': '取消',
    'btn-title-copy': '复制',
    'btn-title-merge': '合并',
    'btn-title-split': '拆分',
    'btn-title-delete': '删除',
    'btn-title-confirm': '确认',
    // msg
    'msg-delete-title': '删除',
    'msg-delete-subtitle': '删除结果？',
    'msg-merge-different-class': '不能合并不同标签',
    'msg-merge-conflict': '存在合并冲突，请在时间轴里查看',
    'msg-merge-success': '合并成功',
    'msg-split-empty': '不能创建空对象',
    'msg-split-success': '拆分成功',
    'msg-delete-success': '删除成功',
    'msg-copy-success': '复制成功',
    'msg-no-object': '无对象',

    // const
    Dynamic: '动态框',
    Fixed: '固定框',
    Standard: '标准框',
    Copied: '复制',
    Predicted: '模型预测',
    'True-Value': '人工标注',
};

export { zh };
