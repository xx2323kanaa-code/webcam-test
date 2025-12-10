import {
  ObjectDetector,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5";

const btn = document.getElementById("startBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const labelBox = document.getElementById("labelBox");

let detector;
let running = false;

btn.addEventListener("click", async () => {
  btn.style.display = "none";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });
  video.srcObject = stream;
  await video.play();

  await waitForSize();
  resizeCanvas();

  await initDetector_light();   // ★ 軽量モデルを使う
  running = true;

  detectLoop();
});

function waitForSize() {
  return new Promise((resolve) => {
    const check = () => {
      if (video.videoWidth > 0) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });
}

function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

// ------------------------------------------------------
// ★ 軽量モデル EfficientDet-lite0 FLOAT32 版
// ------------------------------------------------------
async function initDetector_light() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5/wasm"
  );

  detector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://cdn.jsdelivr.net/gh/azukiazusa/model-host/efficientdet_lite0_float32.tflite",
    },
    runningMode: "video",
    maxResults: 3,
    scoreThreshold: 0.5
  });
}

// ------------------------------------------------------
// Detection Loop
// ------------------------------------------------------
async function detectLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const result = await detector.detectForVideo(video, performance.now());

  if (result.detections.length > 0) {
    for (const det of result.detections) {
      const b = det.boundingBox;
      const name = det.categories[0].categoryName;

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 4;
      ctx.strokeRect(b.originX, b.originY, b.width, b.height);

      labelBox.textContent = name;
    }
  } else {
    labelBox.textContent = "";
  }

  requestAnimationFrame(detectLoop);
}
