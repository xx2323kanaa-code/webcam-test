let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let startBtn = document.getElementById("startBtn");

async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });
  video.srcObject = stream;
  video.muted = true;
  video.playsinline = true;
  await video.play();
}

function drawLoop() {
  if (video.videoWidth > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(drawLoop);
}

startBtn.onclick = async () => {
  startBtn.style.display = "none";
  await initCamera();
  drawLoop();
};
