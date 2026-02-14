const fileInput=document.getElementById("fileInput");
const popup=document.getElementById("popup");
const cameraPopup=document.getElementById("cameraPopup");
const video=document.getElementById("video");
const preview=document.getElementById("preview");
const result=document.getElementById("result");

let stream=null;
let file=null;


// ---------- detect mobile ----------
function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


// ---------- main button ----------
function openSelect(){

  if(isMobile()){
    // มือถือ → เปิดแอปกล้องจริง
    fileInput.setAttribute("capture","environment");
    fileInput.click();
  }
  else{
    // desktop → popup
    popup.style.display="flex";
  }
}


// ---------- choose file ----------
function openGallery(){
  popup.style.display="none";
  fileInput.removeAttribute("capture");
  fileInput.click();
}


// ---------- open notebook camera ----------
async function openDesktopCamera(){

  popup.style.display="none";

  stream=await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user"} // กล้องหน้า
  });

  video.srcObject=stream;
  cameraPopup.style.display="flex";
}


// ---------- close ----------
function closeCamera(){
  if(stream) stream.getTracks().forEach(t=>t.stop());
  cameraPopup.style.display="none";
}


// ---------- capture ----------
function capture(){

  const canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;

  canvas.getContext("2d").drawImage(video,0,0);

  canvas.toBlob(blob=>{
    file=new File([blob],"photo.jpg",{type:"image/jpeg"});

    preview.innerHTML=`<img src="${URL.createObjectURL(blob)}">`;

    closeCamera();
    sendAPI();
  });
}


// ---------- mobile file selected ----------
fileInput.addEventListener("change",()=>{
  file=fileInput.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onload=e=>{
    preview.innerHTML=`<img src="${e.target.result}">`;
    sendAPI();
  };
  reader.readAsDataURL(file);
});


// ---------- API ----------
async function sendAPI(){

  const form=new FormData();
  form.append("file",file);

  const res=await fetch("http://localhost:8001/predict",{
    method:"POST",
    body:form
  });

  const data=await res.json();
  result.innerHTML=data.prediction;
}
