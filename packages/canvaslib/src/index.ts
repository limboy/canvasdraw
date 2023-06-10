abstract class Shape {
  filter: string;
  lineCap: "butt" | "round" | "square";
  lineJoin: "round" | "bevel" | "miter";
  strokeWeight: number;
  strokeColor?: string | CanvasGradient | CanvasPattern;
  strokeDash: number[];
  fillColor?: string | CanvasGradient | CanvasPattern;
  shadowColor?: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  children: Shape[];
  x: number;
  y: number;
  parent?: Shape;
  rotateAnchor?: [number, number];
  rotateAngle?: number;
  flipH: boolean;
  flipV: boolean;
  scale?: [number, number];
  debug: boolean;
  _mask?: Shape;
  _preInstructions: any[];
  _postInstructions: any[];
  _errorMessage: string;
  // it will be set when processing instructions
  _canvas: Canvas;
  // some scenario(like mask) should save context first
  _saveContext: boolean;

  constructor(x: number, y: number) {
    this.filter = "none";
    this.strokeWeight = 0;
    this.strokeColor = "black";
    this.lineCap = "square";
    this.lineJoin = "miter";
    this.strokeDash = [];
    this.fillColor = undefined;
    this.shadowColor = undefined;
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.children = [];
    this.x = x;
    this.y = y;
    this.parent = undefined;
    this.rotateAnchor = undefined;
    this.rotateAngle = undefined;
    this.flipH = false;
    this.flipV = false;
    this.scale = undefined;
    this.debug = false;
    this._mask = undefined;
    this._preInstructions = [];
    this._postInstructions = [];
    this._saveContext = false;
  }

  abstract get instructions(): any[];

  set mask(target: Shape | undefined) {
    this._mask = target;
    this._saveContext = !!target;
  }

  get mask() {
    return this._mask;
  }

  get parentX() {
    let x = 0;
    if (this.parent) {
      let parent = this.parent;
      x = this.parent.x;
      while (parent.parent) {
        parent = parent.parent;
        x += parent.x;
      }
    }
    return x;
  }

  get parentY() {
    let y = 0;
    if (this.parent) {
      let parent = this.parent;
      y = this.parent.y;
      while (parent.parent) {
        parent = parent.parent;
        y += parent.y;
      }
    }
    return y;
  }

  get canvas(): Canvas {
    let topParent = this as Shape;
    let parent = this.parent;
    while (parent) {
      topParent = parent;
      parent = parent.parent;
    }
    return topParent._canvas;
  }

  get preInstructions(): any[] {
    let _instructions = this._preInstructions.slice();

    if (this._saveContext) {
      _instructions.push(["save"]);
      if (this.children.length > 0) {
        let child = this.children[this.children.length - 1];
        while (child.children.length > 0) {
          child = child.children[child.children.length - 1];
        }
        child.appendInstruction(["restore"]);
      } else {
        this.appendInstruction(["restore"]);
      }
    }

    if (this._mask) {
      let maskInstructions = this._mask.instructions;
      maskInstructions.push(["clip"]);
      _instructions = _instructions.concat(maskInstructions);
    }

    _instructions.push([
      "setTransform",
      devicePixelRatio,
      0,
      0,
      devicePixelRatio,
      0,
      0,
    ]);

    if (this.rotateAngle) {
      let rotateAnchor = this.rotateAnchor;
      if (!rotateAnchor) {
        rotateAnchor = [this.x + this.parentX, this.y + this.parentY];
      }
      _instructions.push(["translate", rotateAnchor[0], rotateAnchor[1]]);
      _instructions.push(["rotate", this.rotateAngle]);
      _instructions.push(["translate", -rotateAnchor[0], -rotateAnchor[1]]);
    }

    if (this.scale && this.scale.length > 0) {
      _instructions.push(["scale", this.scale[0], this.scale[1]]);
    }

    if (this.flipH) {
      _instructions.push(["translate", this.canvas.width, 0]);
      _instructions.push(["scale", -1, 1]);
    }

    if (this.flipV) {
      _instructions.push(["translate", 0, this.canvas.height]);
      _instructions.push(["scale", 1, -1]);
    }

    if (this.fillColor) {
      _instructions.push([".fillStyle", this.fillColor]);
    }

    _instructions.push([".filter", this.filter]);

    if (this.strokeWeight > 0) {
      _instructions.push([".strokeStyle", this.strokeColor]);
      _instructions.push([".lineWidth", this.strokeWeight]);
      _instructions.push([".lineCap", this.lineCap]);
    } else {
      _instructions.push([".lineWidth", 0]);
      _instructions.push([".strokeStyle", "rgba(0,0,0,0)"]);
    }

    _instructions.push([".lineJoin", this.lineJoin]);
    _instructions.push(["setLineDash", this.strokeDash]);

    if (this.shadowColor) {
      _instructions.push([".shadowColor", this.shadowColor]);
      _instructions.push([".shadowOffsetX", this.shadowOffsetX]);
      _instructions.push([".shadowOffsetY", this.shadowOffsetY]);
      _instructions.push([".shadowBlur", this.shadowBlur]);
    } else {
      _instructions.push([".shadowColor", "rgba(0,0,0,0)"]);
    }
    return _instructions;
  }

  get postInstructions() {
    return this._postInstructions;
  }

  prependInstruction(instruction: any[]) {
    this._preInstructions.push(instruction.slice());
  }

  appendInstruction(instruction: any[]) {
    this._postInstructions.push(instruction.slice());
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  addChild(child: Shape) {
    this.children.push(child);
    child.parent = this;
  }

  removeChild(child: Shape) {
    const index = this.children.findIndex((elm) => elm === child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }
}

class Circle extends Shape {
  r: number;
  startAngle: number;
  endAngle: number;

  constructor(
    x: number,
    y: number,
    r: number,
    startAngle = 0,
    endAngle = Math.PI * 2,
  ) {
    super(x, y);
    this.r = r;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
  }

  get instructions() {
    let _instructions = super.preInstructions;
    _instructions.push(["beginPath"]);
    _instructions.push([
      "arc",
      this.x + this.parentX,
      this.y + this.parentY,
      this.r,
      this.startAngle,
      this.endAngle,
    ]);
    if (this.fillColor) {
      _instructions.push(["fill"]);
    }

    if (this.strokeColor) {
      _instructions.push(["stroke"]);
    }

    return _instructions.concat(super.postInstructions);
  }
}

class Ellipse extends Shape {
  rx: number;
  ry: number;
  rotation: number;
  startAngle: number;
  endAngle: number;

  constructor(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation = 0,
    startAngle = 0,
    endAngle = Math.PI * 2,
  ) {
    super(x, y);
    this.rx = rx;
    this.ry = ry;
    this.rotation = rotation;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
  }

  get instructions() {
    let _instructions = super.preInstructions;
    _instructions.push(["beginPath"]);
    _instructions.push([
      "ellipse",
      this.x + this.parentX,
      this.y + this.parentY,
      this.rx,
      this.ry,
      this.rotation,
      this.startAngle,
      this.endAngle,
    ]);
    if (this.fillColor) {
      _instructions.push(["fill"]);
    }

    if (this.strokeColor) {
      _instructions.push(["stroke"]);
    }

    return _instructions.concat(super.postInstructions);
  }
}

class Polygon extends Shape {
  r: number;
  n: number;
  constructor(x: number, y: number, r: number, n: number) {
    super(x, y);
    this.r = r;
    this.n = n;
  }

  get instructions() {
    if (this.n < 3) {
      return [];
    }

    let _instructions = super.preInstructions;
    _instructions.push(["beginPath"]);
    _instructions.push([
      "translate",
      this.x + this.parentX,
      this.y + this.parentY,
    ]);
    _instructions.push(["rotate", -Math.PI / 2]);
    _instructions.push(["moveTo", this.r, 0]);

    const angle = (Math.PI * 2) / this.n;
    for (let i = 0; i < this.n; i++) {
      _instructions.push([
        "lineTo",
        this.r * Math.cos(angle * i),
        this.r * Math.sin(angle * i),
      ]);
    }

    _instructions.push(["closePath"]);

    if (this.fillColor) {
      _instructions.push(["fill"]);
    }

    if (this.strokeColor) {
      _instructions.push(["stroke"]);
    }

    return _instructions.concat(super.postInstructions);
  }
}

class Rect extends Shape {
  width: number;
  height: number;
  radius: number;
  _img?: HTMLImageElement;

  constructor(x: number, y: number, width: number, height: number, radius = 0) {
    super(x, y);
    this.width = width;
    this.height = height;
    this.radius = radius;
    this._img = undefined;
  }

  drawImage(img: string) {
    this._img = new Image();
    this._img.src = img;
  }

  get instructions() {
    let _instructions = super.preInstructions;
    _instructions.push(["beginPath"]);
    let action = (Array.isArray(this.radius) || this.radius > 0)
      ? "roundRect"
      : "rect";
    // Safari doesn't support roundRect until iOS 16
    if (this.canvas.ctx && !this.canvas.ctx["roundRect"]) {
      action = "rect";
    }

    if (!this._img) {
      _instructions.push([
        action,
        this.x + this.parentX,
        this.y + this.parentY,
        this.width,
        this.height,
        this.radius,
      ]);
    } else {
      _instructions.push([
        "drawImage",
        this._img,
        this.x + this.parentX,
        this.y + this.parentY,
        this.width,
        this.height,
      ]);
    }

    if (this.fillColor) {
      _instructions.push(["fill"]);
    }

    if (this.strokeColor) {
      _instructions.push(["stroke"]);
    }

    return _instructions.concat(super.postInstructions);
  }
}

class Path extends Shape {
  actions: any[];
  constructor(x: number, y: number) {
    super(x, y);
    this.actions = [];
    this.moveTo(x, y);
  }

  clear() {
    this.actions = [];
  }

  lineTo(newX: number, newY: number) {
    this.actions.push({ name: "lineTo", data: [newX, newY] });
  }

  moveTo(newX: number, newY: number) {
    this.actions.push({ name: "moveTo", data: [newX, newY] });
  }

  quadraticCurveTo(cpX: number, cpY: number, endX: number, endY: number) {
    this.actions.push({
      name: "quadraticCurveTo",
      data: [cpX, cpY, endX, endY],
    });
  }

  bezierCurveTo(
    cp1X: number,
    cp1Y: number,
    cp2X: number,
    cp2Y: number,
    endX: number,
    endY: number,
  ) {
    this.actions.push({
      name: "bezierCurveTo",
      data: [cp1X, cp1Y, cp2X, cp2Y, endX, endY],
    });
  }

  closePath() {
    this.actions.push({ name: "closePath" });
  }

  get instructions() {
    let _instructions = super.preInstructions;
    _instructions.push(["beginPath"]);

    this.actions.forEach((action) => {
      let instruction = [action.name];
      if (action.data) {
        let data = action.data.slice();
        data = data.map((item, index) =>
          index % 2 === 0 ? item + this.parentX : item + this.parentY
        );
        data.forEach((d) => instruction.push(d));
      }
      _instructions.push(instruction);
    });

    if (this.strokeColor) {
      _instructions.push(["stroke"]);
    }

    if (this.fillColor) {
      _instructions.push(["fill"]);
    }

    return _instructions.concat(super.postInstructions);
  }
}

class TextItem extends Shape {
  text: string;
  font: string;
  align: "left" | "right" | "center" | "start" | "end";
  constructor(x: number, y: number, text: string) {
    super(x, y);
    this.text = text;
    // format: 'normal 80px Sans-serif';
    this.font = "";
    this.align = "left";
  }

  get instructions() {
    let _instructions = super.preInstructions;

    _instructions.push([".textAlign", this.align]);
    if (this.font) {
      _instructions.push([".font", this.font]);
    }

    if (this.strokeColor) {
      _instructions.push([
        "strokeText",
        this.text,
        this.x + this.parentX,
        this.y + this.parentY,
      ]);
    }

    if (this.fillColor) {
      _instructions.push([
        "fillText",
        this.text,
        this.x + this.parentX,
        this.y + this.parentY,
      ]);
    }

    return _instructions.concat(super.postInstructions);
  }
}

class Canvas {
  x: number;
  y: number;
  screenshotFrame: number;
  fillColor: string;
  fps: number;
  width: number;
  height: number;
  keepPrevResult: boolean;
  redrawOnClick: boolean;

  _children: Shape[];
  _showGrid: boolean;
  _ctx: CanvasRenderingContext2D;
  _copyImageDataInstructions: any[];
  _cutImageDataInstructions: any[];
  _gridSize: number;
  _gridColor: string;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.x = 0;
    this.y = 0;
    this.screenshotFrame = 0;
    this.fps = 0;
    this.fillColor = "";
    this.keepPrevResult = false;
    this.redrawOnClick = false;

    this._children = [];
    this._showGrid = false;
    this._copyImageDataInstructions = [];
    this._cutImageDataInstructions = [];
    this._ctx = ctx;
    this.width = width;
    this.height = height;
    this._gridSize = 100;
    this._gridColor = "rgba(0,0,0,0.2)";
  }

  copyRectToPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    newX: number,
    newY: number,
  ) {
    const rect = new Rect(0, 0, 0, 0);
    rect._canvas = this;
    rect.appendInstruction(["copyImageData", x, y, width, height, newX, newY]);
    this._children.push(rect);
  }

  cutRectToPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    newX: number,
    newY: number,
  ) {
    const rect = new Rect(0, 0, 0, 0);
    rect._canvas = this;
    rect.appendInstruction(["cutImageData", x, y, width, height, newX, newY]);
    this._children.push(rect);
  }

  get centerX() {
    return Math.floor(this.width / 2);
  }

  get centerY() {
    return Math.floor(this.height / 2);
  }

  get ctx() {
    return this._ctx;
  }

  blendMode(newMode: GlobalCompositeOperation) {
    const rect = new Rect(0, 0, 0, 0);
    rect._canvas = this;
    rect.appendInstruction([".globalCompositeOperation", newMode]);
    this._children.push(rect);
  }

  showGrid(gridSize = 100, gridColor = "rgba(0,0,0,0.2)") {
    this._showGrid = true;
    this._gridSize = gridSize;
    this._gridColor = gridColor;
  }

  addChild(child: Shape) {
    child._canvas = this;
    this._children.push(child);
  }

  removeChild(child: Shape) {
    const index = this._children.findIndex((elm) => elm === child);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
  }

  reset() {
    this.initalInstructions.forEach((instruction) => {
      let funcName = instruction[0] as string;
      if (funcName.startsWith(".")) {
        this._ctx[funcName.slice(1)] = instruction[1];
      } else {
        this._ctx[funcName].apply(this._ctx, instruction.slice(1));
      }
    });
  }

  _generateGrid(): any[] {
    let stepSize = this._gridSize;
    let gridInstructions: any[] = [];
    gridInstructions.push([".lineWidth", 1]);
    gridInstructions.push([".strokeStyle", this._gridColor]);
    for (let i = stepSize; i < this.width; i += stepSize) {
      if (i % stepSize === 0) {
        gridInstructions.push(["beginPath"]);
        gridInstructions.push(["moveTo", i, 0]);
        gridInstructions.push(["lineTo", i, this.height]);
        gridInstructions.push(["stroke"]);
      }
    }

    for (let j = stepSize; j < this.height; j += stepSize) {
      if (j % stepSize === 0) {
        gridInstructions.push(["beginPath"]);
        gridInstructions.push(["moveTo", 0, j]);
        gridInstructions.push(["lineTo", this.width, j]);
        gridInstructions.push(["stroke"]);
      }
    }
    gridInstructions.push([".strokeStyle", "rgba(0,0,0,0)"]);
    return gridInstructions;
  }

  get initalInstructions() {
    let instructions = [
      ["setTransform", devicePixelRatio, 0, 0, devicePixelRatio, 0, 0],
      [".globalCompositeOperation", "source-over"],
    ];

    if (!this.keepPrevResult) {
      instructions.push(["clearRect", 0, 0, this.width, this.height]);
    }

    if (this.fillColor) {
      instructions.push([".fillStyle", this.fillColor]);
      instructions.push(["fillRect", 0, 0, this.width, this.height]);
    }

    if (this._showGrid) {
      instructions = instructions.concat(this._generateGrid());
    }

    return instructions;
  }

  get instructions() {
    let instructions = this.initalInstructions;

    function iterChildren(children) {
      children.forEach((child) => {
        if (child.debug) {
          console.log(child.instructions);
        }
        instructions = instructions.concat(child.instructions);
        if (child.children) {
          iterChildren(child.children);
        }
      });
    }
    iterChildren(this._children);

    return instructions;
  }

  cutImageData([x, y, width, height, newX, newY]: [number, number, number, number, number, number]) {
    const instruction = [x, y, width, height, newX, newY];
    this._ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    let data = instruction.map((value) => value * devicePixelRatio);
    let imageData = this._ctx.getImageData(
      data[0],
      data[1],
      data[2],
      data[3],
    );
    this._ctx.clearRect(instruction[0], instruction[1], instruction[2], instruction[3]);
    this._ctx.putImageData(imageData, data[4], data[5]);
  }

  copyImageData([x, y, width, height, newX, newY]: [number, number, number, number, number, number]) {
    const instruction = [x, y, width, height, newX, newY];
    this._ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    let data = instruction.map((value) => value * devicePixelRatio);
    let imageData = this._ctx.getImageData(
      data[0],
      data[1],
      data[2],
      data[3],
    );
    this._ctx.putImageData(imageData, data[4], data[5]);
  }

  render(onError = (e: Error) => {
    console.log(e.stack);
  }) {
    try {
      this.instructions.forEach((instruction) => {
        let funcName = instruction[0] as string;
        if (funcName.startsWith(".")) {
          this._ctx[funcName.slice(1)] = instruction[1];
        } else {
          if (funcName === "copyImageData") {
            const params = instruction.slice(1) as [number, number, number, number, number, number];
            this.copyImageData(params);
          } else if (funcName === "cutImageData") {
            const params = instruction.slice(1) as [number, number, number, number, number, number];
            this.cutImageData(params);
          } else {
            this._ctx[funcName].apply(this._ctx, instruction.slice(1));
          }
        }
      });
    } catch (e) {
      onError(e);
    }
  }
}

export { Canvas, Circle, Ellipse, Path, Polygon, Rect, TextItem };
