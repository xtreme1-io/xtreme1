import ImageView from '../index';
import Konva from 'konva';
import { Shape } from '../shape';

export function hackContext(view: ImageView, layer: Konva.Layer) {
  const context = layer.canvas.context;

  // copy from Konva.Context#_stroke
  context._stroke = function (shape: Shape) {
    const dash = shape.dash(),
      // ignore strokeScaleEnabled for Text
      strokeScaleEnabled = (shape as any).getStrokeScaleEnabled();

    if (shape.hasStroke()) {
      if (!strokeScaleEnabled) {
        this.save();
        const pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }

      this._applyLineCap(shape);
      if (dash && shape.dashEnabled()) {
        this.setLineDash(dash);
        this.setAttr('lineDashOffset', shape.dashOffset());
      }

      let scale = 1;
      if (shape.attrs.skipStageScale) {
        scale = 1 / view.stage.scaleX();
      }
      if (shape.defaultStyle?.hitStrokeWidth) {
        shape.setAttrs({
          hitStrokeWidth: Number(shape.defaultStyle.hitStrokeWidth) * scale,
        });
      }
      const baseLineWidth = view.editor.state.config.baseLineWidth || 0;
      this.setAttr('lineWidth', (shape.strokeWidth() + baseLineWidth) * scale);

      if (!(shape as any).getShadowForStrokeEnabled()) {
        this.setAttr('shadowColor', 'rgba(0,0,0,0)');
      }

      const hasLinearGradient = (shape as any).getStrokeLinearGradientColorStops();
      if (hasLinearGradient) {
        (this as any)._strokeLinearGradient(shape);
      } else {
        this.setAttr('strokeStyle', shape.stroke());
      }

      shape._strokeFunc(this);

      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  };

  (context as any)._fillColor = function (shape: Shape) {
    const state = shape.state;
    const { fillColorRgba } = shape.attrs;
    const { r, g, b, a } = fillColorRgba;

    let addOpacity = 0;
    if (state && (state.hover || state.select)) {
      addOpacity = view.editor.state.config.baseFillOpacity || 0;
    }
    this.setAttr('fillStyle', `rgba(${r},${g},${b},${a + addOpacity})`);
    shape._fillFunc(this);
  };

  layer.hitCanvas.context.fillStrokeShape = function fillStrokeShape(shape: Shape) {
    this.fillShape(shape);
    this.strokeShape(shape);
  };
}
