import "./style.css";
// @ts-ignore
import * as CanvasItems from "canvaslib";
import store from "store2";
import util from './util';

declare const codeEditor: {
  getValue: () => string;
  setValue: (newValue: string) => void;
  state?: {};
};

let __frame = 0;
let __codeErrMsg = "";
let __animationId = 0;
let __store = {};
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const error = document.querySelector("#error") as HTMLCanvasElement;
const canvasContainer = document.querySelector("#canvas-container")!;

(function addCanvaslibToGlobalScope() {
  type CanvasItemsKey = keyof typeof CanvasItems;

  for (let item of Object.keys(CanvasItems)) {
    (window as any)[item] = CanvasItems[item as CanvasItemsKey];
  }
})();

(function saveCodeContinously() {
  setInterval(() => {
    const code = codeEditor.getValue();
    if (codeEditor.state) {
      store.set("code", code);
    }
  }, 3000);
})();

function resizeCanvasDom() {
  const ctx = canvas.getContext("2d")!;
  canvas.width = Math.floor(canvasContainer.clientWidth * devicePixelRatio);
  canvas.height = Math.floor(canvasContainer.clientHeight * devicePixelRatio);

  // Normalize coordinate system to use CSS pixels.
  ctx.scale(devicePixelRatio, devicePixelRatio);
}

async function tick() {
  if (__codeErrMsg) {
    error.innerHTML = "<pre>" + __codeErrMsg + "</pre>";
    error.classList.remove("hidden");
  } else if (typeof (window as any)["draw"] !== "undefined") {
    const draw = (window as any)["draw"];
    const __canvas = new CanvasItems.Canvas(
      canvas.getContext("2d")!,
      canvas.width / devicePixelRatio,
      canvas.height / devicePixelRatio,
    );

    const payload = {
      uri: location.pathname + location.search,
      frame: __frame++,
    };
    if (draw.constructor.name == "AsyncFunction") {
      await draw(__canvas, payload, __store, util);
    } else {
      draw(__canvas, payload, __store, util);
    }

    if (
      parseInt(canvas.getAttribute("height")!) !==
      __canvas.height * devicePixelRatio
    ) {
      canvas.setAttribute("height", __canvas.height * devicePixelRatio + "");
      canvas.setAttribute("width", __canvas.width * devicePixelRatio + "");
      canvas.style.height = __canvas.height + "px";
      canvas.style.width = __canvas.width + "px";
    }

    __canvas.render((err: Error) => {
      __codeErrMsg = err.message + "\n" + err.stack;
      tick();
    });

    if (__canvas.fps > 0) {
      if (__animationId) {
        cancelAnimationFrame(__animationId);
      }
      setTimeout(() => {
        __animationId = requestAnimationFrame(tick);
      }, Math.max(1000 / 60, 1000 / __canvas.fps));
    }

    if (__canvas.redrawOnClick) {
      canvas.addEventListener("click", tick);
    } else {
      canvas.removeEventListener("click", tick, false);
    }
  }
}

function run() {
  __frame = 0;
  __codeErrMsg = "";
  error.classList.add("hidden");
  try {
    let func = new Function("return " + codeEditor.getValue().trim());
    (window as any)["draw"] = func();
  } catch (e: unknown) {
    if (e instanceof Error) {
      __codeErrMsg = e.message + "\n" + e.stack;
    }
  }
  tick();
}

function loadSnippetIfNeeded() {
  const url = new URL(location.href);
  let snippetId = url.searchParams.get("snippet");
  if (!snippetId) {
    if (url.pathname.indexOf("/snippet/") !== -1) {
      snippetId = url.pathname.split("/")[2];
    }

    if (url.pathname.indexOf("/render/") !== -1) {
      snippetId = url.pathname.split("/")[2];
    }
  }

  if (!snippetId) {
    const localCode = store.get("code");
    if (localCode) {
      codeEditor.setValue(localCode);
      run();
      return;
    } else {
      snippetId = "SUPgjqfeURh";
    }
  }

  const snippetUrl = "https://corsproxy.limboy.me/" +
    "https://go.dev/_/share?id=" + snippetId;
  fetch(snippetUrl).then((data) => data.text()).then((result) => {
    codeEditor.setValue(result);
    run();
  }).catch((e) => {
    if (e instanceof Error) {
      console.log(e);
    }
  });
}

(function () {
  if (document.querySelector("#run")) {
    document.querySelector("#run")!.addEventListener("click", run);

    addEventListener("keydown", function (e) {
      if (e.metaKey && e.key === "Enter") {
        run();
      }
    });

    const shareBtn = document.querySelector("#share")! as HTMLButtonElement;
    shareBtn.addEventListener("click", () => {
      shareBtn.disabled = true;
      shareBtn.textContent = "Publishing...";
      const snippet = codeEditor.getValue();
      const postUrl = "https://corsproxy.limboy.me/https://go.dev/_/share";
      fetch(postUrl, { method: "POST", body: snippet }).then((data) =>
        data.text()
      ).then((snippetId) => {
        shareBtn.disabled = false;
        shareBtn.textContent = "Publish";
        const url = location.protocol + "//" + location.host + "/render/" + snippetId;
        window.open(url, "_blank");
      });
    });
  }
})();

(function init() {
  resizeCanvasDom();
  loadSnippetIfNeeded();
})();
