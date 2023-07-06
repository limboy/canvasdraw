// just for code completion, will be removed when rendering
import { Canvas, Ellipse, Circle, Path, Polygon, Rect, TextItem } from '../packages/yaoocanvas/dist'

// view render result: https://canvasdraw.limboy.me/render/https://github.com/limboy/canvasdraw/raw/main/snippets/joy-division.js

/**
 * @typedef {Object} Noise
 * @property {(x: number, y: number) => number} simplex2
 * @property {(x: number, y: number, z: number) => number} simplex3
 * @property {(x: number, y: number) => number} perlin2
 * @property {(x: number, y: number, z: number) => number} perlin3
 * @property {(val: number) => voide} seed
 */

/**
 * 
 * @param {Canvas} canvas 
 * @param {{query:string, frame:string}} payload 
 * @param {{get:(string) => string, set:(string, string)}} store 
 * @param {{noise:Noise}} util 
 */
function draw(canvas, payload, store, util) {
  canvas.width = 400;
  canvas.redrawOnClick = true;
  canvas.fillColor = "rgba(0,0,0,0)"

  const topOffset = 50;
  canvas.height = canvas.width + topOffset;
  const lineCount = 19;
  const lineGap = canvas.width / (lineCount + 1);
  const sublineCount = 30;
  const sublineLength = canvas.width / sublineCount;

  for (let i = 0; i < lineCount; i++) {
    const line = new Path(0, (i + 1) * lineGap + topOffset);
    for (let j = 1; j <= sublineCount; j++) {
      const variation = Math.max(0, (sublineCount / 2 - Math.abs(sublineCount / 2 - j) - 3)) / (sublineCount / 2 - 3);
      const yOffset = Math.random() * lineGap * 3 * variation * -1;
      line.strokeWeight = 2;
      line.strokeColor = "black";
      line.fillColor = "white";
      line.lineTo(j * sublineLength, (i + 1) * lineGap + yOffset + topOffset);
    }
    line.blendModeForFill = "destination-out";
    canvas.addChild(line);
  }
}
