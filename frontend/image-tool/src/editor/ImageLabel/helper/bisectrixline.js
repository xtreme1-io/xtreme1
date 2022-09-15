import Konva from 'konva';
import { xytoArr, getScaleFactor, HELPNAME } from '../util';
class BisectrixLine {
    constructor(view) {
        this.view = view;
        this.layer = view.background._layer;
        this.content = view.background.content;
        this.hidden = false;
        this.lines = [];
        this.Stage = this.view.Stage;
        // Set aliquot maximum value
        this.verticalCountMax = 50;
        this.horizontalCountMax = 50;
        this.bisectrixConfig = {
            verticalCount: 2,
            horizontalCount: 2,
            hidden: true,
        };
        this.hidden = this.bisectrixConfig.hidden;
        // read initial value
        this.verticalCount = this.bisectrixConfig.verticalCount || 2;
        this.horizontalCount = this.bisectrixConfig.horizontalCount || 2;
        this.render();
    }
    update({ vertical, horizontal, enable }) {
        this.verticalCount = vertical;
        if (vertical > this.verticalCountMax) {
            this.verticalCount = this.verticalCountMax;
        }
        this.horizontalCount = horizontal;
        if (horizontal > this.horizontalCountMax) {
            this.horizontalCount = this.horizontalCountMax;
        }
        this.hidden = !enable;
        this.bisectrixConfig.verticalCount = this.verticalCount;
        this.bisectrixConfig.horizontalCount = this.horizontalCount;
        this.bisectrixConfig.hidden = this.hidden;
        this.render();
    }
    render() {
        let content = this.view.background.content;
        if (!content) return;
        this.lines.forEach((line) => {
            line.destroy();
            line = null;
        });
        let minY = 0;
        let minX = 0;
        let maxX = content.dim.width;
        let maxY = content.dim.height;
        let count = this.verticalCount;
        let delta = content.dim.width / count;
        let poi = content.image.position();
        while (count > 1) {
            let line = new Konva.Line({
                ...poi,
                points: xytoArr([
                    {
                        x: delta * (count - 1),
                        y: minY,
                    },
                    {
                        x: delta * (count - 1),
                        y: maxY,
                    },
                ]),
                strokeWidth: 1 * getScaleFactor(this.view),
                stroke: 'rgba(179, 224, 143, 0.70)',
                name: HELPNAME,
                listening: false,
                visible: !this.hidden,
            });
            line.addName('bisectrixline');
            count--;
            this.lines.push(line);
            this.layer.add(line);
        }
        minX = 0;
        count = this.horizontalCount;
        delta = content.dim.height / count;
        while (count > 1) {
            let line = new Konva.Line({
                ...poi,
                points: xytoArr([
                    {
                        x: minX,
                        y: delta * (count - 1),
                    },
                    {
                        y: delta * (count - 1),
                        x: maxX,
                    },
                ]),
                strokeWidth: 1.5 * getScaleFactor(this.view),
                stroke: 'rgba(179, 224, 143, 0.70)',
                name: HELPNAME,
                listening: false,
                visible: !this.hidden,
            });
            line.addName('bisectrixline');
            this.layer.add(line);
            this.lines.push(line);
            count--;
        }
        this.layer.batchDraw();
    }
    toggle() {
        this.hidden = !this.hidden;
        this.bisectrixConfig.hidden = this.hidden;
        this.render();
    }
    destroy() {
        this.lines.forEach((line) => {
            line.destroy();
            line = null;
        });
        this.lines = [];
        this.hidden = true;
        this.layer = null;
        this.Stage = null;
        this.view = null;
    }
}
export default BisectrixLine;
