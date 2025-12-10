const btn = document.getElementById("startBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

btn.addEventListener("click", async () => {
  btn.style.display = "none";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },  // 前面カメラ固定
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    // ★ video のサイズが取れるまで待つ
    await waitForVideoSize();

    // ★ Canvas を video と完全に一致させる
    resizeCanvas();

    // ★ 四角を描くだけのテスト
    drawYellowBox();

  } catch (err) {
    alert("カメラエラー: " + err);
  }
});


function waitForVideoSize() {
  return new Promise((resolve) => {
    const check = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

function drawYellowBox() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 6;

  const boxWidth = canvas.width * 0.4;
  const boxHeight = canvas.height * 0.4;
  const x = (canvas.width - boxWidth) / 2;
  const y = (canvas.height - boxHeight) / 2;

  ctx.strokeRect(x, y, boxWidth, boxHeight);

  requestAnimationFrame(drawYellowBox);
}
