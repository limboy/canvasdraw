import { Canvas, Ellipse, Circle, Path, Polygon, Rect, TextItem } from '../packages/yaoocanvas/dist'

// view render result: https://canvasdraw.limboy.me/render/https://github.com/limboy/canvasdraw/raw/main/snippets/un-deux-trois.js

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
  const size = Math.min(canvas.height, 400);
  const strokeWeight = 3;
  const step = 20;
  const aThirdOfHeight = size / 3;

  canvas.width = size;
  canvas.height = size;
  canvas.redrawOnClick = true;

  function drawLine(x, y, width, height, positions) {
    const rect = new Rect(x, y, width, height);
    canvas.addChild(rect);
    const angle = Math.random() * 5;
    rect.rotateAngle = angle;
    rect.rotateAnchor = [width / 2, height / 2];
    for (let i = 0; i < positions.length; i++) {
      const line = new Path(positions[i] * width, 0);
      line.lineTo(line.x, height);
      line.lineCap = "round";
      line.strokeWeight = strokeWeight;
      rect.addChild(line);
    }
  }

  for (var y = step; y < size - step; y += step) {
    for (var x = step; x < size - step; x += step) {
      if (y < aThirdOfHeight) {
        drawLine(x, y, step, step, [0.5]);
      } else if (y < aThirdOfHeight * 2) {
        drawLine(x, y, step, step, [0.2, 0.8]);
      } else {
        drawLine(x, y, step, step, [0.1, 0.5, 0.9]);
      }
    }
  }
}
