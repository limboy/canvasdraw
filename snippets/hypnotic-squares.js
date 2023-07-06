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
  const strokeWeight = 2;
  const tileStep = 7;
  const squareSteps = [3, 4, 4, 5, 5, 5];
  let squareStep = squareSteps[1];
  const canvasSize = Math.min(canvas.width, 400);
  const squareSize = canvasSize / tileStep;
  const finalSize = 4;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvas.redrawOnClick = true;

  const container = new Rect(0, 0, canvas.width, canvas.height);
  container.strokeColor = "black";
  container.strokeWeight = strokeWeight * 2;
  canvas.addChild(container);

  function drawSquares(x, y, step, xTilt, yTilt) {
    if (step >= 0) {
      const newSize = step / squareStep * (squareSize - finalSize) + finalSize;
      let newX = x + (squareSize - newSize) / 2;
      let newY = y + (squareSize - newSize) / 2;
      if (step < squareStep) {
        newX += (squareSize / squareStep) / (step + 1.75) * xTilt;
        newY += (squareSize / squareStep) / (step + 1.75) * yTilt;
      }
      const square = new Rect(newX, newY, newSize, newSize);
      square.strokeColor = "black";
      square.strokeWeight = strokeWeight;
      canvas.addChild(square);
      step--;
      drawSquares(x, y, step, xTilt, yTilt);
    }
  }

  for (let i = 0; i < tileStep; i++) {
    for (let j = 0; j < tileStep; j++) {
      const x = i / tileStep * canvasSize;
      const y = j / tileStep * canvasSize;
      const tilt = [0, 1, -1];
      const xTilt = tilt[Math.floor(Math.random() * tilt.length)];
      const yTilt = tilt[Math.floor(Math.random() * tilt.length)];
      squareStep = squareSteps[Math.floor(Math.random() * squareSteps.length)];
      drawSquares(x, y, squareStep, xTilt, yTilt);
    }
  }
}
