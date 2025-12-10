// ===== デバッグモード：必ず原因が画面に表示される =====

import {
  ObjectDetector,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5";

let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let labelBox = document.getElementById("label");
let startBtn = document.getElementById("startBtn");

// ← 追加：画面にエラー表示するための領域
const debugDiv = document.createElement("div");
debugDiv.style.position = "absolute";
debugDiv.style.bottom = "10px";
debugDiv.style.left = "10px";
debugDiv.style.padding = "10px";
debugDiv.style.background = "rgba(0,0,0,0.7)";
debugDiv.style.color = "yellow";
debugDiv.style.fontSize = "16px";
debugDiv.style.zIndex = "99999";
document.body.appendChild(debugDiv);

function log(msg) {
  console.log(msg);
  debugDiv.textContent = msg;
}

let detector;
let running = false;

async function initCamera() {
  try {
    log("要求中：getUserMedia…");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    log("成功：ストリーム取得");

    video.srcObject = stream;
    video.muted = true;
    video.playsinline = true;

    await video.play();
    log("video.play() 成功");

    return new Promise((resolve) => {
      if (video.readyState >= 2) {
        log("video ready");
        resolve();
      } else {
        video.onloadeddata = () => {
          log("video onloadeddata");
          resolve();
        };
      }
    });
  } catch (e) {
    log("getUserMedia エラー: " + e.message);
    throw e;
  }
}

async function initDetector() {
  try {
    log("Detector 読み込み中…");

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5/wasm"
    );

    detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/object_detector.tflite"
      },
      scoreThreshold: 0.5,
      runningMode: "video"
    });

    log("Detector 準備完了");
  } catch (e) {
    log("Detector エラー: " + e.message);
    throw e;
  }
}

async function loop() {
  if (!running) return;

  if (video.videoWidth === 0) {
    log("videoWidth = 0…待機中");
    requestAnimationFrame(loop);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  try {
    const result = await detector.detectForVideo(video, performance.now());
    log("検出中…");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result.detections.length > 0) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 4;

      const det = result.detections[0];
      const b = det.boundingBox;
      ctx.strokeRect(b.originX, b.originY, b.width, b.height);

      labelBox.textContent = det.categories[0].categoryName;
    }

    requestAnimationFrame(loop);
  } catch (e) {
    log("detect エラー: " + e.message);
  }
}

async function startApp() {
  startBtn.style.display = "none";

  try {
    await initCamera();
    await initDetector();
    running = true;
    log("loop 開始");
    loop();
  } catch (e) {
    log("startApp エラー: " + e.message);
  }
}

startBtn.onclick = startApp;
