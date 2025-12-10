import {
  ObjectDetector,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.5";

let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let labelBox = document.getElementById("label");
let startBtn = document.getElementById("startBtn");

let detector;
let running = false;

async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });

  video.srcObject = stream;
  video.muted = true;     // ← Android Chrome 対策
  video.playsinline = true;

  await video.play();      // ← これが成功するようになる

  return new Promise((resolve) => {
    if (video.readyState >= 2) {
      resolve();
    } else {
      video.onloadeddata = () => resolve();
    }
  });
}


async function initDetector() {
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
}

function getCenterTarget(detections) {
  if (!detections || detections.length === 0) return null;

  const cx = video.videoWidth / 2;
  const cy = video.videoHeight / 2;

  let best = null;
  let bestDist = Infinity;

  detections.forEach(det => {
    const b = det.boundingBox;
    const bx = b.originX + b.width / 2;
    const by = b.originY + b.height / 2;

    const d = (bx - cx) ** 2 + (by - cy) ** 2;
    if (d < bestDist) {
      best = det;
      bestDist = d;
    }
  });

  return best;
}

async function loop() {
  if (!running) return;

  // videoWidth が 0 の場合は待つ（スマホで起きる）
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    requestAnimationFrame(loop);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const result = await detector.detectForVideo(video, performance.now());
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (result.detections.length > 0) {
    const target = getCenterTarget(result.detections);

    if (target) {
      const b = target.boundingBox;

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 4;
      ctx.strokeRect(b.originX, b.originY, b.width, b.height);

      const name = target.categories[0].categoryName;
      labelBox.textContent = name;
    }
  } else {
    labelBox.textContent = "";
  }

  requestAnimationFrame(loop);
}

async function startApp() {
  startBtn.style.display = "none"; 

  await initCamera();
  await initDetector();

  running = true;
  loop();
}

startBtn.onclick = startApp;
