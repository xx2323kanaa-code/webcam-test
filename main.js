const btn = document.getElementById("startBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

btn.addEventListener("click", async () => {
  btn.style.display = "none";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, 
      audio: false
    });

    video.srcObject = stream;

    await video.play();

    // Canvas のサイズを video に合わせる
    function resize() {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    video.addEventListener("loadedmetadata", resize);
    window.addEventListener("resize", resize);

    drawTestBox(); // ★ 次へ

  } catch (err) {
    alert("カメラエラー: " + err);
  }
});

function drawTestBox() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 画面中央にテスト用の黄色い四角
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 6;

  const boxWidth = canvas.width * 0.4;
  const boxHeight = canvas.height * 0.4;
  const x = (canvas.width - boxWidth) / 2;
  const y = (canvas.height - boxHeight) / 2;

  ctx.strokeRect(x, y, boxWidth, boxHeight);

  requestAnimationFrame(drawTestBox);
}

