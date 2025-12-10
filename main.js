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

    // ★★★ ここが重要：サイズが取れるまで待つ ★★★
    function waitForSize() {
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

    await waitForSize();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    drawTestBox();

  } catch (err) {
    alert("カメラエラー: " + err);
  }
});


function drawTestBox() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 6;

  const boxWidth = canvas.width * 0.4;
  const boxHeight = canvas.height * 0.4;
  const x = (canvas.width - boxWidth) / 2;
  const y = (canvas.height - boxHeight) / 2;

  ctx.strokeRect(x, y, boxWidth, boxHeight);

  requestAnimationFrame(drawTestBox);
}
