let model;
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// モデル読み込み
async function loadModel() {
  model = await cocoSsd.load();
}

startBtn.addEventListener("click", async () => {
  startBtn.style.display = "none";

  await loadModel();

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  detect();
});

async function detect() {
  const predictions = await model.detect(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  predictions.forEach(pred => {
    const [x, y, width, height] = pred.bbox;

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "lime";
    ctx.font = "20px sans-serif";
    ctx.fillText(pred.class, x, y > 20 ? y - 5 : y + 20);
  });

  requestAnimationFrame(detect);
}
