const selector = `sign-attr-id`;
const highLightClass = 'qa-warn-highlight';
export enum QaNodeTarget {
  OBJECT = 'OBJECT', // 标注结果列表高亮
  CLASS = 'CLASS', // class标签卡片高亮
  CLASSIFICATION = 'CLASSIFICATION', // classifications
  FRAME = 'FRAME', // 切帧
  VALIDITY = 'VALIDITY', // valid
}

export default function highLight() {
  function getNodeBySelectorId(ids: string[]) {
    const nodeList: HTMLDivElement[] = [];
    ids.forEach((id) => {
      const node = document.querySelector(`div[${selector}="${id}"]`) as HTMLDivElement;
      node && nodeList.push(node);
    });
    return nodeList;
  }
  // 设置高亮
  function setHighlight(ids?: string[]) {
    console.log('============highlight ids:', ids);
    reset();
    if (!ids || ids.length === 0) return;
    const nodeArr = getNodeBySelectorId(ids);
    console.log('==============highlight nodes', nodeArr);
    nodeArr.forEach((node) => {
      node.classList.add(highLightClass);
    });
  }

  // 重置高亮状态
  function reset() {
    const nodeArr = document.querySelectorAll(`div[${selector}]`) as any as HTMLDivElement[];
    nodeArr.forEach((node) => {
      node.classList.remove(highLightClass);
    });
  }

  return {
    reset,
    setHighlight,
    QaNodeTarget,
  };
}
