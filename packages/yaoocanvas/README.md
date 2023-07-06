## Yet Another Object Oriented Canvas Library

`CanvasRenderingContext2D` is powerful on drawing, but it's API is not user friendly, especially if you want to draw a bunch of stuff. this library make it easier to draw.

## Usage

you can try it on https://canvasdraw.limboy.me

```js
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
      
      const line = new Path(0,0);
      line.strokeWeight = 2;
      line.strokeColor = "black";
      line.lineTo(squareSize, squareSize);
      
      if (Math.random() > 0.5) {
      	line.rotateAnchor = [squareSize/2, squareSize/2];
        line.rotateAngle = Math.PI/2;
      }
      square.addChild(line);
    }
  }
}
```

![](https://pb.limboy.me/api/files/5bjm4lerlkz55pc/4qwwkd8oaidxlns/18UFnCyivDb_V39EoLQchG.webp)

## API

not fully writen down, you can inspect details in `src/index.ts`.

### Canvas
```js
class Canvas {
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number);

  // default is white
  // same as CanvasRenderingContext2D's `fillStyle`
  fillColor: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;

  // display grid to help position
  showGrid();

  // only instances added by `addChild` will be shown
  addChild(someShape);

  // duplicate part of the canvas into new position
  copyRectToPosition(x, y, width, height, newX, newY);

  // cut part of the canvas into new position
  cutRectToPosition(x, y, width, height, newX, newY);
}
```
### Shape
`Shape` is base class of all Shapes. it has common properties and methods.

```js
abstract class Shape {
  x: number;
  y: number;
  // same as CanvasRenderingContext2D's `filter` property
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
  filter: string; 
  // how should line's end behavior
  lineCap: "butt" | "round" | "square";
  // how should line joined together
  lineJoin: "round" | "bevel" | "miter";
  // line width
  strokeWeight: number;
  // same as CanvasRenderingContext2D's `strokeStyle` 
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle
  strokeColor?: string | CanvasGradient | CanvasPattern;
  // same as CanvasRenderingContext2D's `setLineDash()`
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
  strokeDash: number[];
  // same as CanvasRenderingContext2D's `fillStyle` 
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle
  fillColor?: string | CanvasGradient | CanvasPattern;
  // same as CanvasRenderingContext2D's `shadowColor`
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowColor
  shadowColor?: string;
  // same as CanvasRenderingContext2D's `shadowBlur`
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
  shadowBlur: number;
  // same as CanvasRenderingContext2D's `shadowOffsetX`
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX
  shadowOffsetX: number;
  // same as CanvasRenderingContext2D's `shadowOffsetY`
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY
  shadowOffsetY: number;
  // [x, y]
  rotateAnchor?: [number, number];
  // Math.PI * 2
  rotateAngle?: number;
  // horizontal flip
  flipH: boolean;
  // vertical flip
  flipV: boolean;
  // same as CanvasRenderingContext2D's `scale` 
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale
  scale?: [number, number];
  // log current instance to console
  debug: boolean;
  // use a shape instance as mask
  mask: Shape?

  // clone a new instance
  clone();

  // someShape's coordinator will be relative to current instance
  addChild(someShape);
}
```

### Circle
```js
class Circle extends Shape {
  constructor(
    x: number,
    y: number,
    r: number,
    startAngle = 0,
    endAngle = Math.PI * 2,
  );
}
```

### Ellipse
```js
class Ellipse extends Shape {
  constructor(
    x: number,
    y: number,
    rx: number, // horizontal radius width
    ry: number, // vertical radius height
    rotation = 0, // full is Math.PI * 2
    startAngle = 0,
    endAngle = Math.PI * 2,
  );
}
```

### Polygon
```js
class Polygon extends Shape {
  constructor(
    x: number, 
    y: number, 
    r: number, // radius
    n: number // how many sides
    );
}
```

### Rect

```js
class Rect extends Shape {
  constructor(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius = 0
  );

  // img is base64 string like `data:image/jpeg;base64,/...`
  drawImage(img:string);
}
```

### Path

```js
class Path extends Shape {
  constructor(x: number, y: number);

  // reset everything, including initial position
  clear();

  // draw line to new position
  lineTo(newX: number, newY: number);

  // move to new position
  moveTo(newX: number, newY: number);

  // same as CanvasRenderingContext2D's quadraticCurveTo
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/quadraticCurveTo
  quadraticCurveTo(cpX: number, cpY: number, endX: number, endY: number);

  // same as CanvasRenderingContext2D's bezierCurveTo
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/bezierCurveTo
  bezierCurveTo( cp1X: number, cp1Y: number, cp2X: number, cp2Y: number, endX: number, endY: number);

  // same as CanvasRenderingContext2D's `closePath()`
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/closePath
  closePath();
}
```

### TextItem

```js
class TextItem extends Shape {
  constructor(
    x: number, 
    y: number, 
    text: string
  );

  // same as CanvasRenderingContext2D's font
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
  font: string;

  align: "left" | "right" | "center" | "start" | "end";
}
```