const input = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("result");
const placeholder = document.querySelector(".placeholder");
const popup = document.getElementById("selectPopup");
const cameraModal = document.getElementById("cameraModal");
const video = document.getElementById("video");

let file=null;
let stream=null;


// ---------- detect mobile ----------
function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


// ---------- main button ----------
function pick(){

  if(isMobile()){
    input.setAttribute("capture","environment");
    input.click();
  }
  else{
    popup.style.display="flex";
  }
}


// ---------- gallery ----------
function openGallery(){
  popup.style.display="none";
  input.removeAttribute("capture");
  input.click();
}


// ---------- camera notebook ----------
async function openCamera(){
  popup.style.display="none";

  stream = await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user"}
  });

  video.srcObject=stream;
  cameraModal.style.display="flex";
}


// ---------- close camera ----------
function closeCamera(){
  if(stream) stream.getTracks().forEach(t=>t.stop());
  cameraModal.style.display="none";
}


// ---------- capture ----------
function capture(){

  const canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  canvas.getContext("2d").drawImage(video,0,0);

  canvas.toBlob(blob=>{
    file=new File([blob],"photo.jpg",{type:"image/jpeg"});
    showPreview(URL.createObjectURL(blob));
    closeCamera();
    analyze();
  });
}


// ---------- file select ----------
input.addEventListener("change",()=>{
  file=input.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onload=e=>{
    showPreview(e.target.result);
    analyze();
  };
  reader.readAsDataURL(file);
});


// ---------- preview ----------
function showPreview(src){
  preview.src=src;
  preview.style.display="block";
  placeholder.style.display="none";
}


// ---------- analyze ----------
async function analyze(){

  loader.style.display="block";
  resultBox.style.display="none";

  const form=new FormData();
  form.append("file",file);

  try{
    const res=await fetch("http://localhost:8001/predict",{
      method:"POST",
      body:form
    });

    const data=await res.json();

    loader.style.display="none";
    resultBox.style.display="block";

    let text=data.prediction.replace(
      "สิ่งมีชีวิตในภาพคือ",
      "<b>สิ่งมีชีวิตในภาพคือ</b>"
    );

    text=text.replace(
      /: (.*)/,
      ': <span style="font-size:20px;font-weight:600">$1</span>'
    );

    resultBox.innerHTML=text;

  }catch{
    loader.style.display="none";
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  }
}
