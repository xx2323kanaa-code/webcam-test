const startBtn = document.getElementById("startBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const labelBox = document.getElementById("labelBox");

let detector = null;

// -----------------------------------------------------------
// MediaPipe Solutions 版 Object Detection
// -----------------------------------------------------------
async function initObjectron() {
  return new Promise((resolve) => {
    const objectron = new Objectron({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/objectron/${file}`
    });

    objectron.setOptions({
      modelName: "Cup", // 軽量モデル（コップ）
      maxNumObjects: 1,
    });

    objectron.onResults((results) => drawResults(results));

    resolve(objectron);
  });
}

// -----------------------------------------------------------
// カメラ開始
// -----------------------------------------------------------
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

  detector = await initObjectron();
  processVideoFrame();
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

// -----------------------------------------------------------
// フレームごとに Objectron を適用
// -----------------------------------------------------------
async function processVideoFrame() {
  await detector.send({ image: video });
  requestAnimationFrame(processVideoFrame);
}

// -----------------------------------------------------------
// 検出結果描画
// -----------------------------------------------------------
function drawResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results || !results.objectDetections) return;

  const dets = results.objectDetections;
  if (dets.length === 0) {
    labelBox.textContent = "";
    return;
  }

  const det = dets[0];
  const box = det.locationData.relativeBoundingBox;

  const x = box.xmin * canvas.width;
  const y = box.ymin * canvas.height;
  const w = box.width * canvas.width;
  const h = box.height * canvas.height;

  ctx.strokeStyle = "lime";
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  labelBox.textContent = "cup（コップ判定モデル）";
}
