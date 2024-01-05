import Konva from 'konva';
import { AnnotateObject } from '../type';

export function traverse(objects: AnnotateObject[], fn: (e: AnnotateObject) => void) {
  objects.forEach((e) => {
    fn(e);
  });
}
export function traverseShape(objects: AnnotateObject[], fn: (e: Konva.Shape) => void) {
  objects.forEach((e) => {
    if (e instanceof Konva.Shape) {
      fn(e);
    }
    if (e instanceof Konva.Container && e.children) {
      traverseShape(e.children, fn);
    }
  });
}
