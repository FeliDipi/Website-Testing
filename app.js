const $input = document.getElementById("input-capture");
$input.addEventListener("change", (e)=>
{
    const [file] = $input.files;
    if (file) {
        var captureURL = URL.createObjectURL(file);
        let imgCapture = document.getElementById("image-capture");
        imgCapture.setAttribute("src", captureURL);

        unityAvatarInstance.SendMessage('BrowserCallback', 'SetCaptureURL', captureURL);
    }
});

const $videoCapture = document.getElementById("video-capture");
const $canvasCapture = document.getElementById("snap-capture");
let contextCapture = $canvasCapture.getContext("2d");

const $buttonSnap = document.getElementById("button-capture");
$buttonSnap.addEventListener("click",(e)=>
{
    contextCapture.drawImage($videoCapture,0,0,$canvasCapture.width,$canvasCapture.height);
    $canvasCapture.toBlob((blob) => {
        if (blob === null) {
          console.log("Failed to convert canvas to blob");
          return;
        }
        
        const realtimeCaptureURL = (window.URL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
        console.log("Capture Object: " + blob + " // Capture URL: " + realtimeCaptureURL);

        unityAvatarInstance.SendMessage('BrowserCallback', 'SetCaptureURL', realtimeCaptureURL);
    },'image/jpeg');
});

ActiveWebCam();

function LoadImage(key) {

    console.log("Avatar Capture key: " + key);

    // IndexedDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
        dbVersion = 21; //version of database

    let db;
    // open database
    var request = indexedDB.open("/idbfs", dbVersion)
    request.onsuccess = function(e){

        console.log("Success accessing IndexedDB database");

        db = request.result;//save database hash
        var transaction = db.transaction(["FILE_DATA"], IDBTransaction.READ_WRITE);
        transaction.objectStore("FILE_DATA").get(key).onsuccess = function (event) {
            var imgFile = event.target.result;//get file object of avatar capture
            var blob = new Blob([imgFile.contents], { type: "image/png" });//format file object to image object to convert as URL link

            // Create and revoke ObjectURL
            var imgURL = (window.URL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);

            // Set img src to ObjectURL
            let img = document.getElementById("avatar-image");
            img.setAttribute("src", imgURL);
        };
    }

    request.onerror = function (event) {
        console.log("Error accessing IndexedDB database");
    };
}

function ActiveWebCam()
{
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        navigator.mediaDevices.getUserMedia({video:true}).then((stream)=>{
            $videoCapture.srcObject = stream;
            $videoCapture.play();
        });
    }
}