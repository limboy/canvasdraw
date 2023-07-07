import express from "express";
import * as https from 'https';
import fs from "fs"
import fetch from 'node-fetch';
import * as url from 'url';
import { createCanvas, Image } from "canvas";
import * as CanvasItems from "../yaoocanvas/dist/index.mjs";
import util from '../utils/dist/index.mjs';

const { createHash, } = await import('node:crypto');
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const distDir = __dirname + "/../frontend/dist";
const baseUrl = process.env.NODE_ENV === "dev" ? "http://localhost:3727" : "https://canvasdraw.limboy.me"

const app = express();
app.use('/assets', express.static(distDir + "/assets"));

const port = 3727;
const snippetImagesDir = __dirname + "/snippet-images";

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function requestSnippet(snippetId) {
  return new Promise((resolve, reject) => {
    https.get("https://go.dev/_/share?id=" + snippetId, (resp) => {
      var str = ''
      resp.on('data', function (chunk) {
        str += chunk;
      });

      resp.on('end', function () {
        resolve(str);
      });
    }).on("error", (err) => {
      console.log("error: " + err.message);
      reject(err);
    });
  })
}

function imageFilenameForUri(uri) {
  return createHash('md5').update(uri).digest("hex") + ".png";
}

async function handleSnippet(snippetId, uri) {
  let snippet = await requestSnippet(snippetId);
  if (snippet.trim() === "Snippet not found") {
    return;
  }
  // remove imports
  snippet = snippet.replaceAll(/^import .*$/gm, '');
  // remove comments;
  snippet = snippet.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g, '');
  const filename = imageFilenameForUri(uri);
  const defaultCanvasWidth = 800;
  const defaultCanvasHeight = 800;

  function _createCanvas(width, height) {
    let canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    return canvas;
  }

  async function _drawCanvas(target, payload, store) {
    if (globalThis["draw"].constructor.name == 'AsyncFunction') {
      await globalThis["draw"](target, payload, store, util);
    } else {
      globalThis["draw"](target, payload, store, util);
    }
  }

  let _func = new Function("return " + snippet.trim());
  globalThis["draw"] = _func();

  let canvas = _createCanvas(defaultCanvasWidth, defaultCanvasHeight);
  let needRedraw = false;

  let _canvas = new globalThis["Canvas"](canvas.getContext('2d'), canvas.width, canvas.height);
  _drawCanvas(_canvas, { uri, frame: 0 }, {});

  if (_canvas.width !== defaultCanvasWidth) {
    canvas = _createCanvas(_canvas.width * devicePixelRatio, _canvas.height * devicePixelRatio);
    _canvas = new globalThis["Canvas"](canvas.getContext('2d'), canvas.width, canvas.height);
    needRedraw = true;
  }

  let frame = _canvas.screenshotFrame;
  if (frame > 0) {
    needRedraw = true;
  }

  if (needRedraw) {
    _canvas.reset();
    _drawCanvas(_canvas, { uri, frame }, {});
  }

  _canvas.render();

  const buf = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE })

  if (!fs.existsSync(snippetImagesDir)) {
    fs.mkdirSync(snippetImagesDir);
  }

  fs.writeFileSync(snippetImagesDir + "/" + filename, buf);
}

(function addToGlobalScope() {
  for (let itemKey of Object.keys(CanvasItems)) {
    globalThis[itemKey] = CanvasItems[itemKey];
  }

  globalThis["devicePixelRatio"] = 2;
  globalThis["fetch"] = fetch;
  globalThis["Image"] = Image;
})()

app.get("/render/:snippetId([A-Za-z0-9_-]+).png", async (req, res) => {
  const snippetId = req.params.snippetId;
  const filename = imageFilenameForUri(req.originalUrl);
  const imagePath = snippetImagesDir + "/" + filename;
  if (!fs.existsSync(imagePath)) {
    await handleSnippet(snippetId, req.originalUrl);
  }
  const options = {
    root: snippetImagesDir,
    dotfiles: 'deny',
    headers: {
      'content-type': "image/png",
    }
  }
  res.sendFile(filename, options, function (err) {
    if (err) {
      console.log(err);
    }
  });
})

app.get("/snippet/:snippetId\.js", async (req, res) => {
  const snippetId = req.params.snippetId;
  const snippetUrl = "https://go.dev/_/share?id=" + snippetId;
  const result = await fetch(snippetUrl);
  const script = await result.text();
  res
    .header("content-type", "text/javascript")
    .send(script);
});

app.get("/snippet/:snippetId", (req, res) => {
  let htmlCnt = fs.readFileSync(distDir + "/code.html", "utf8");
  res
    .header("content-type", "text/html")
    .send(htmlCnt)
});

app.get("/render/:snippetId", async (req, res) => {
  let htmlCnt = fs.readFileSync(distDir + "/render.html", "utf8");
  res
    .header("content-type", "text/html")
    .send(htmlCnt)
});

app.get("/render/*", async (req, res) => {
  const scriptUrl = req.url.replace("/render/", "");
  if (!isValidHttpUrl(scriptUrl)) {
    res.send("invalid js url");
    return;
  }

  const devHosts = ["127.0.0.1", "localhost"];
  const host = new URL(scriptUrl).hostname;

  let htmlCnt = fs.readFileSync(distDir + "/render.html", "utf8");
  if (devHosts.indexOf(host) === -1) {
    const result = await fetch(scriptUrl);
    const script = (await result.text()).replaceAll(/^import .*$/gm, '');
    htmlCnt = htmlCnt.replace("// __REPLACE_ME__", `${script};\n\n_code=draw.toString();\n`);
  }

  res
    .header("content-type", "text/html")
    .header("Cache-Control", "s-maxage=0") // to avoid cloudflare cache
    .send(htmlCnt)
});

app.get("/", (req, res) => {
  const indexHtmlCnt = fs.readFileSync(distDir + "/index.html", "utf8");
  res
    .header("content-type", "text/html")
    .send(indexHtmlCnt)
})

app.listen(port, () => {
  console.log("listening on " + port);
});
