const popup = document.getElementById("popup");
const cameraPopup = document.getElementById("cameraPopup");
const previewBox = document.getElementById("previewBox");
const loader = document.getElementById("loader");
const resultBox = document.getElementById("result");
const fileInput = document.getElementById("fileInput");
const video = document.getElementById("video");

let stream=null;
let file=null;


// ---------- detect mobile ----------
function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


// ---------- open select ----------
function openPopup(){

  // ถ้าเป็นมือถือ → เปิดกล้องทันที
  if(isMobile()){
    startCamera();
    return;
  }

  // ถ้าเป็น desktop → popup เลือก
  popup.style.display="flex";
}

function closePopup(){
  popup.style.display="none";
}


// ---------- gallery ----------
function openGallery(){
  closePopup();
  fileInput.click();
}

fileInput.addEventListener("change",()=>{
  file=fileInput.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onload=e=>{
    previewBox.innerHTML=`<img src="${e.target.result}">`;
    analyze();
  };
  reader.readAsDataURL(file);
});


// ---------- camera ----------
async function startCamera(){

  closePopup();

  try{
    stream=await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:"user" },
      audio:false
    });
  }catch{
    stream=await navigator.mediaDevices.getUserMedia({video:true});
  }

  cameraPopup.style.display="flex";
  video.srcObject=stream;
}


// ---------- close camera ----------
function closeCamera(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
  }
  cameraPopup.style.display="none";
}


// ---------- capture ----------
function capture(){

  const canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;

  const ctx=canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  canvas.toBlob(blob=>{
    file=new File([blob],"photo.jpg",{type:"image/jpeg"});
    previewBox.innerHTML=`<img src="${URL.createObjectURL(blob)}">`;
    closeCamera();
    analyze();
  });
}


// ---------- send api ----------
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

  }catch(err){
    loader.style.display="none";
    alert("เชื่อมต่อ API ไม่ได้");
    console.error(err);
  }
}
