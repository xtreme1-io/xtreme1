import { AnnotateObject, IFrame, utils, ToolType } from 'image-editor';
import Editor from '../common/Editor';

export function interpolateObject(
  trackId: string,
  editor: Editor,
  type: ToolType,
  frameIndex?: number,
) {
  const { frameIndex: curIndex } = editor.state;

  frameIndex = frameIndex || curIndex;
  const { preObject, backObject } = getInterpolateObjects(editor, frameIndex, (obj) => {
    return obj.toolType === type && obj.userData.trackId === trackId;
  }) as {
    preObject: AnnotateObject;
    backObject: AnnotateObject;
  };

  const object = preObject || backObject;

  if (!object) return;

  const newObject = object.cloneThisShape(false) as AnnotateObject;

  if (preObject && backObject) {
    const prePosition = getAbPosition(preObject);
    const backPosition = getAbPosition(backObject);
    newObject.position({
      x: (prePosition.x + backPosition.x) / 2,
      y: (prePosition.y + backPosition.y) / 2,
    });
  } else if (preObject) {
    newObject.position(getAbPosition(preObject));
  } else if (backObject) {
    newObject.position(getAbPosition(backObject));
  }

  let config;
  if (newObject.isGroup()) {
    const info = interpolateChild();
    config = { object: newObject, ...info };
  } else {
    config = { object: newObject };
  }

  return config;

  function interpolateChild() {
    // exist object
    const frame = editor.getCurrentFrame();
    const objects = editor.dataManager.getFrameObject(frame.id) || [];
    const existMap = {} as Record<string, AnnotateObject>;
    utils.traverse(objects, (obj) => {
      const userData = editor.getUserData(obj);
      const trackId = userData.trackId || '';
      existMap[trackId] = obj;
    });

    const allChildren = new Map() as Map<string, AnnotateObject>;
    if (preObject?.member.length > 0) {
      preObject.member.forEach((e) => {
        const userData = editor.getUserData(e);
        const trackId = userData.trackId || '';
        if (!allChildren.has(trackId)) allChildren.set(trackId, e);
      });
    }

    if (backObject?.member.length > 0) {
      backObject.member.forEach((e) => {
        const userData = editor.getUserData(e);
        const trackId = userData.trackId || '';
        if (!allChildren.has(trackId)) allChildren.set(trackId, e);
      });
    }

    const children = [] as AnnotateObject[];
    const addChildren = [] as AnnotateObject[];
    allChildren.forEach((e) => {
      const userData = editor.getUserData(e);
      const trackId = userData.trackId || '';

      let obj = existMap[trackId];
      if (!obj) {
        obj = e.cloneThisShape();
        addChildren.push(obj);
      }
      children.push(obj);
    });

    return { children, addChildren };
  }
}

export function getAbPosition(object: AnnotateObject) {
  return object.getAbsolutePosition(object.getStage() as any);
}

export function getInterpolateObjects(
  editor: Editor,
  frameIndex: number,
  filter: (e: AnnotateObject) => boolean,
) {
  const { frames } = editor.state;

  let preIndex = frameIndex - 1;
  let backIndex = frameIndex + 1;
  let preObject = undefined as AnnotateObject | undefined;
  let backObject = undefined as AnnotateObject | undefined;

  while ((preIndex >= 0 && !preObject) || (backIndex <= frames.length - 1 && !backObject)) {
    if (!preObject && preIndex >= 0) {
      preObject = findObject(frames[preIndex], editor, filter);
      preIndex--;
    }

    if (!backObject && backIndex <= frames.length - 1) {
      backObject = findObject(frames[backIndex], editor, filter);
      backIndex++;
    }
  }

  return { preObject, backObject };
}

function findObject(frame: IFrame, editor: Editor, filter: (e: AnnotateObject) => boolean) {
  const objects = editor.dataManager.getFrameObject(frame.id) || [];

  let object = undefined as AnnotateObject | undefined;
  utils.traverse(objects, (obj) => {
    if (!object && filter(obj)) {
      object = obj;
    }
  });
  // let object = objects.find(filter);
  return object;
}
