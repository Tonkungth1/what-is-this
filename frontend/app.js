const popup = document.getElementById("popup");
const cameraPopup = document.getElementById("cameraPopup");
const video = document.getElementById("video");
const previewBox = document.getElementById("previewBox");
const loader = document.getElementById("loader");
const result = document.getElementById("result");
const fileInput = document.getElementById("fileInput");

let stream = null;
let file = null;


// ---------------- MOBILE CHECK ----------------
function isMobile(){
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


// ---------------- POPUP ----------------
function openPopup(){
  popup.style.display="flex";
}

function closePopup(){
  popup.style.display="none";
}


// ---------------- GALLERY ----------------
function openGallery(){
  closePopup();
  fileInput.removeAttribute("capture");
  fileInput.click();
}


// ---------------- CAMERA ----------------
async function startCamera(){

  closePopup();

  // 📱 mobile → เปิดกล้องหลัง
  if(isMobile()){
    fileInput.setAttribute("accept","image/*");
    fileInput.setAttribute("capture","environment"); // กล้องหลัง
    fileInput.click();
    return;
  }

  // 💻 desktop → popup กล้องหน้า
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:"user" }
    });

    video.srcObject = stream;
    cameraPopup.style.display="flex";

  }catch(err){
    alert("เปิดกล้องไม่ได้");
  }
}



// ---------------- CLOSE CAMERA ----------------
function closeCamera(){
  if(stream){
    stream.getTracks().forEach(track=>track.stop());
  }
  cameraPopup.style.display="none";
}


// ---------------- CAPTURE ----------------
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


// ---------------- FILE SELECT ----------------
fileInput.addEventListener("change",()=>{

  file=fileInput.files[0];
  if(!file) return;

  const reader=new FileReader();
  reader.onload=e=>{
    showPreview(e.target.result);
    analyze();
  };
  reader.readAsDataURL(file);
});


// ---------------- PREVIEW ----------------
function showPreview(src){
  previewBox.innerHTML=`<img src="${src}">`;
}


// ---------------- API ----------------
async function analyze(){

  loader.style.display="block";
  result.style.display="none";

  const form=new FormData();
  form.append("file",file);

  try{

    const res = await fetch("https://animal-api-6cvu.onrender.com/predict", {
      method:"POST",
      body:form
    });

    const data=await res.json();

    loader.style.display="none";
    result.style.display="block";
    result.innerHTML=data.prediction;

  }catch{
    loader.style.display="none";
    alert("เชื่อมต่อ API ไม่ได้");
  }
}
