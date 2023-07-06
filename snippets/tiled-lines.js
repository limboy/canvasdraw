import { Canvas, Ellipse, Circle, Path, Polygon, Rect, TextItem } from '../packages/yaoocanvas/dist'

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
  canvas.width = Math.min(canvas.width, 400);
  canvas.height = canvas.width;
  canvas.redrawOnClick = true;

  const squaresPerRow = 20;
  const squaresPerColumn = 20;
  const squareSize = canvas.width / squaresPerRow;

  for (let i = 0; i < squaresPerRow; i++) {
    for (let j = 0; j < squaresPerColumn; j++) {
      const square = new Rect(i * squareSize, j * squareSize, squareSize, squareSize);
      canvas.addChild(square);

      const line = new Path(0, 0);
      line.strokeWeight = 2;
      line.strokeColor = "black";
      line.lineTo(squareSize, squareSize);

      if (Math.random() > 0.5) {
        line.rotateAnchor = [squareSize / 2, squareSize / 2];
        line.rotateAngle = Math.PI / 2;
      }
      square.addChild(line);
    }
  }
}
