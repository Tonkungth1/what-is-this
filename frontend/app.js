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
// ===== OPTION PICKER SYSTEM =====

const optionBox = document.createElement("div");
optionBox.style.marginTop = "15px";
optionBox.style.display = "none";
optionBox.innerHTML = `
<button class="btn" id="camBtn">📸 ถ่ายรูป</button>
<br><br>
<button class="btn" id="galBtn">🖼 เลือกรูปจากเครื่อง</button>
`;
document.querySelector(".container").appendChild(optionBox);

// สร้าง input กล้อง
const cameraInput = document.createElement("input");
cameraInput.type = "file";
cameraInput.accept = "image/*";
cameraInput.capture = "environment";
cameraInput.hidden = true;
document.body.appendChild(cameraInput);


// override ปุ่ม pick เดิม
function pick(){
  optionBox.style.display = "block";
}


// ===== BUTTON EVENTS =====

document.getElementById("camBtn").onclick = ()=>{
  cameraInput.click();
};

document.getElementById("galBtn").onclick = ()=>{
  input.click();
};


// ===== HANDLE CAMERA FILE =====
cameraInput.addEventListener("change", ()=>{
  file = cameraInput.files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = e=>{
    preview.src = e.target.result;
    preview.style.display="block";
    placeholder.style.display="none";
    optionBox.style.display="none";
    analyze();
  };

  reader.readAsDataURL(file);
});


// ===== HIDE OPTIONS WHEN SELECTED NORMAL FILE =====
input.addEventListener("change", ()=>{
  optionBox.style.display="none";
});



