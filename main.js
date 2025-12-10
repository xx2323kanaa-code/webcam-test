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
// Step1: MediaPipe を先に読み込む
// -----------------------------------------------------
loadBtn.addEventListener("click", async () => {
  loadBtn.textContent = "読み込み中…";

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

    loadBtn.style.display = "none";
    startBtn.style.display = "block";

  } catch (err) {
    alert("MediaPipe 読み込みエラー\n" + err);
    loadBtn.textContent = "再読み込み";
  }
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
