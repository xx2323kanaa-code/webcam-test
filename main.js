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

// ------------------------------------------
// カメラスタート
// ------------------------------------------
btn.addEventListener("click", async () => {
  btn.style.display = "none";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, // 前面カメラ
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    await waitForSize();
    resizeCanvas();

    await initDetector();  // ★ MediaPipe 初期化
    running = true;
    detectLoop();          // ★ MediaPipe で検出開始

  } catch (err) {
    alert("カメラエラー:" + err);
  }
});

// ------------------------------------------
// video のサイズが取れるまで待つ
// ------------------------------------------
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

// ------------------------------------------
// MediaPipe 初期化
// ------------------------------------------
async function initDetector() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5/wasm"
  );

  detector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/object_detector.tflite",
    },
    runningMode: "video",
    scoreThreshold: 0.5
  });
}

// ------------------------------------------
// 検出ループ
// ------------------------------------------
async function detectLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const result = await detector.detectForVideo(video, performance.now());

  if (result.detections.length > 0) {

    for (const det of result.detections) {
      const b = det.boundingBox;
      const name = det.categories[0].categoryName;

      // ★★ MediaPipe の枠 ★★
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
