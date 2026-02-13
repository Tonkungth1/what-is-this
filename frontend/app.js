const input = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("result");
const placeholder = document.querySelector(".placeholder");

let file = null;

function pick() {
  input.click();
}

input.addEventListener("change", () => {
  file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    placeholder.style.display = "none";
    analyze();
  };

  reader.readAsDataURL(file);
});

async function analyze() {
  loader.style.display = "block";
  resultBox.style.display = "none";

  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch("http://localhost:8001/predict", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    loader.style.display = "none";
    resultBox.style.display = "block";
    let text = data.prediction.replace(
      "สิ่งมีชีวิตในภาพคือ",
      "<b>สิ่งมีชีวิตในภาพคือ</b>",
    );

    text = text.replace(
      /: (.*)/,
      ': <span style="font-size:20px;font-weight:600">$1</span>',
    );

    resultBox.innerHTML = text;
  } catch (err) {
    loader.style.display = "none";
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    console.error(err);
  }
}
