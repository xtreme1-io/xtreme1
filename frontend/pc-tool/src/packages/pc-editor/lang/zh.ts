import { ILocale } from './type';

const zh: ILocale = {
    'load-resource-error': '加载资源失败',
    'load-object-error': '加载结果失败',
    'load-classification-error': '加载分类信息失败',
    'load-class-error': '加载标签失败',
    'load-model-error': '加载模型失败',
    'load-dataset-classification-error': '加载数据集分类失败',
    'load-record-error': '加载标注信息失败',
    'load-frame-series-error': '加载连续帧数据失败',
    'invalid-query': '参数不合法',
    'load-error': '加载失败',

    // model
    'load-track': '跟踪中....',
    'track-no-data': '无追踪结果，请检查你的结果信息和追踪方向是否正确',
    'track-error': '追踪错误',
    'track-no-source': '无追踪对象',
    'track-ok': '追踪成功',

    // info
    'load-point': '加载点云....',
    'save-ok': '保存成功',
    'save-error': '保存失败',
    'model-run-error': '模型运行异常',
    'model-run-no-data': '无模型结果',
    'no-point-data': '无点云数据',
    'play-error': '播放异常',
    'unknown-error': '异常错误',
    'network-error': '网络错误',
    'login-invalid': '登录过期',
    'not-login': '未登录',
    'retry':'重试',

    // msg
    'msg-not-save': '是否保存变更?',
    'create-rect-valid': '不允许标注到图片外',
};

export { zh };
