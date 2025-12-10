import {
  ObjectDetector,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5";

const loadBtn = document.getElementById("loadBtn");
const startBtn = document.getElementById("startBtn");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const labelBox = document.getElementById("labelBox");

let detector = null;
let running = false;

// -----------------------------------------------------
// Step1: MediaPipe を先に読み込む（最大3分リトライ）
// -----------------------------------------------------
loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;
  loadBtn.textContent = "MediaPipe 読み込み中…（最大3分）";

  const startTime = Date.now();
  const timeout = 3 * 60 * 1000; // ★ 3分

  while (!detector && Date.now() - startTime < timeout) {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5/wasm"
      );

      detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://cdn.jsdelivr.net/gh/azukiazusa/model-host/efficientdet_lite0_float32.tflite",
        },
        runningMode: "video",
        scoreThreshold: 0.5,
        maxResults: 3
      });

    } catch (err) {
      // ロード失敗しても何もしない → 自動リトライ
      await new Promise(r => setTimeout(r, 2000)); // ★ 2秒待って再試行
    }
  }

  if (!detector) {
    loadBtn.textContent = "読み込み失敗（再試行）";
    loadBtn.disabled = false;
    return;
  }

  // ★ 成功したら
  loadBtn.style.display = "none";
  startBtn.style.display = "block";
});

// -----------------------------------------------------
// Step2: カメラ開始
// -----------------------------------------------------
startBtn.addEventListener("click", async () => {
  startBtn.style.display = "none";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false
  });
  video.srcObject = stream;
  await video.play();

  await waitForSize();
  resizeCanvas();

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

// -----------------------------------------------------
// Detection Loop
// -----------------------------------------------------
async function detectLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (detector) {
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
  }

  requestAnimationFrame(detectLoop);
}
