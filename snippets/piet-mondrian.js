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
  const size = Math.min(canvas.width, 600);
  const step = 6;
  const strokeWeight = 8;
  const splitProbility = 0.55;
  const colorSquareCount = 8;
  const white = '#f9f9f9';
  const black = '#222222';
  // const colors = ['#D40920', '#1356A2', '#F7D842']
  const colors = ['#fff001', '#ff0101', '#0101fd', black];
  const squares = [{ x: 0, y: 0, width: size, height: size }];

  canvas.width = size + strokeWeight;
  canvas.height = size + strokeWeight;
  canvas.redrawOnClick = true;

  const borderRect = new Rect(0, 0, canvas.width, canvas.height);
  canvas.addChild(borderRect);

  const container = new Rect(strokeWeight / 2, strokeWeight / 2, size, size);
  canvas.addChild(container);

  function splitOnX(square, x) {
    const square1 = {
      x: square.x,
      y: square.y,
      width: x - square.x,
      height: square.height
    };

    const square2 = {
      x: x,
      y: square.y,
      width: square.width - square1.width,
      height: square.height
    }

    squares.push(square1);
    squares.push(square2);
  }

  function splitOnY(square, y) {
    const square1 = {
      x: square.x,
      y: square.y,
      width: square.width,
      height: y - square.y
    };

    const square2 = {
      x: square.x,
      y: y,
      width: square.width,
      height: square.height - square1.height
    }

    squares.push(square1);
    squares.push(square2);
  }

  function splitAllSquaresOnX(x) {
    for (var i = squares.length - 1; i >= 0; i--) {
      const square = squares[i];
      const canSplitOnX = Math.random() < splitProbility;
      if (square.x < x && (square.x + square.width) > x && canSplitOnX) {
        squares.splice(i, 1);
        splitOnX(square, x);
      }
    }
  }

  function splitAllSquaresOnY(y) {
    for (var i = squares.length - 1; i >= 0; i--) {
      const square = squares[i];
      const canSplitOnY = Math.random() < splitProbility;
      if (square.y < y && (square.y + square.height) > y && canSplitOnY) {
        squares.splice(i, 1);
        splitOnY(square, y);
      }
    }
  }

  for (let i = 0; i < step; i++) {
    let x = (i + 1) / (step + 1) * size;
    let y = x;

    splitAllSquaresOnX(x);
    splitAllSquaresOnY(y);
  }

  for (let i = 0; i < Math.min(colorSquareCount, squares.length); i++) {
    while (true) {
      const square = squares[Math.floor(Math.random() * squares.length)];
      if (!square.color) {
        square.color = colors[i % colors.length];
        break;
      }
    }
  }

  for (let i = 0; i < squares.length; i++) {
    const square = squares[i];
    const rect = new Rect(square.x, square.y, square.width, square.height);
    rect.strokeColor = "black";
    rect.fillColor = square.color ? square.color : white;
    rect.strokeWeight = strokeWeight;
    container.addChild(rect);
  }
}