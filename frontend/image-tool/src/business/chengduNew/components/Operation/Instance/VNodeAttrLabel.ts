import { Editor } from 'image-editor';
import { VNode, createVNode } from 'vue';
type IProp = {
  editor: Editor;
  attrs: any;
};
export default function AttrLabel(prop: IProp) {
  const { attrs = '', editor } = prop;
  const attrStrArr: (String | VNode)[] = [];
  if (typeof attrs === 'string') {
    attrStrArr.push(attrs);
  } else {
    const _attrs = Object.keys(attrs);
    const attrMap = editor.attrMap;
    _attrs.forEach((attrId, index) => {
      const attr = attrMap.get(attrId);
      const value = attrs ? attrs[attrId] : {};
      let valueStr = String(value.value || '');
      if (attr.latexExpression) {
        attrStrArr.push(
          createVNode('span', {
            style: 'display: inline-block',
            innerHTML: editor.utils.toMMl(valueStr),
          }),
        );
        if (index < _attrs.length - 1) {
          attrStrArr.push(' | ');
        }
        return;
      } else if (attr && attr.options && valueStr) {
        const valArr = valueStr.split(',');
        valArr.forEach((str: string, index: number) => {
          const obj = attr.options.find((e: any) => e.name === str);
          if (obj) valArr[index] = editor.getLabel(obj);
        });
        valueStr = String(valArr);
      }
      attrStrArr.push(valueStr);
      if (index < _attrs.length - 1) {
        attrStrArr.push(' | ');
      }
    });
  }
  return createVNode(
    'div',
    {
      style: {
        display: attrStrArr.length <= 0 ? 'none' : '',
        'word-wrap': 'break-word',
        width: '100%',
      },
      class: 'props',
    },
    attrStrArr,
  );
}
