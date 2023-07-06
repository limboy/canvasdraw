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
  const maxCirclesCount = 500;
  const maxTryCount = 500;
  const minCircleRadius = 2;
  const maxCircleRadius = 100;
  const createdCircles = [];

  const size = Math.min(600, canvas.width);
  canvas.width = size;
  canvas.height = size;
  canvas.redrawOnClick = true;

  function hasCollision(circle) {
    let hasCollision = false;
    for (let i = 0; i < createdCircles.length; i++) {
      const c = createdCircles[i];
      const distance = Math.sqrt(Math.pow(circle.x - c.x, 2) + Math.pow(circle.y - c.y, 2));
      if (distance < (circle.r + c.r)) {
        hasCollision = true;
        break;
      }
    }
    return hasCollision;
  }

  function createCircle() {
    let circle = new Circle(Math.random() * size, Math.random() * size, minCircleRadius);
    let circleCreated = false;
    for (let i = 0; i < maxTryCount; i++) {
      if (!hasCollision(circle)) {
        circleCreated = true;
        break;
      }
      circle = new Circle(Math.random() * size, Math.random() * size, minCircleRadius);
    }

    if (!circleCreated) {
      return false;
    }

    for (let i = circle.r; i <= maxCircleRadius; i++) {
      circle.r++;
      if (hasCollision(circle)) {
        circle.r--;
        break;
      }
    }

    createdCircles.push(circle);
    return circle;
  }

  for (let i = 0; i < maxCirclesCount; i++) {
    let circle = createCircle();

    if (circle) {
      circle.strokeWeight = 2;
      circle.strokeColor = "black";
      canvas.addChild(circle);
    }
  }
}
