$loadingIcon = document.querySelector(".loading-content");

//INPUT CAPTURE
const $input = document.querySelector("#file");
$input.addEventListener("change", (e)=>
{
    const [file] = $input.files;
    if (file) {
        var captureURL = URL.createObjectURL(file);
        let imgCapture = document.querySelector(".photo");
        imgCapture.setAttribute("src", captureURL);

        $loadingIcon.classList.remove("hidden");
        unityAvatarInstance.SendMessage('BrowserCallback', 'SetCaptureURL', captureURL);
    }
});

//REALTIME CAPTURE
const $videoCapture = document.querySelector(".webcam");
const $canvasCapture = document.querySelector(".snapshot");
let contextCapture = $canvasCapture.getContext("2d");

//active webcam to take snap
const $buttonWebcam = document.querySelector("#btn-webcam")
$buttonWebcam.addEventListener("click",(e)=>
{
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !$videoCapture.classList.contains("hidden"))
    {
        navigator.mediaDevices.getUserMedia({video:true}).then((stream)=>{

            $videoCapture.srcObject = stream;
            $videoCapture.play();

            //take snapshot after 3 seconds remaining
            setTimeout(()=>
            {
                $videoCapture.classList.add("hidden");
                contextCapture.drawImage($videoCapture,0,0,$canvasCapture.width,$canvasCapture.height);
                $canvasCapture.toBlob((blob) => {
                    if (blob === null) {
                      console.log("Failed to convert canvas to blob");
                      return;
                    }
                    
                    const realtimeCaptureURL = (window.URL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
                    console.log("Capture URL: " + realtimeCaptureURL);
        
                    let imgCapture = document.querySelector(".capture");
                    imgCapture.setAttribute("src", realtimeCaptureURL);
            
                    $loadingIcon.classList.remove("hidden");
                    unityAvatarInstance.SendMessage('BrowserCallback', 'SetCaptureURL', realtimeCaptureURL);
                },'image/jpeg');
            },3000);

        });
    }
})

//LOAD AVATAR CAPTURE CREATED BY UNITY
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
            let img = document.querySelector(".avatar-capture");
            img.setAttribute("src", imgURL);
            img.classList.add("full");
        };
    }

    request.onerror = function (event) {
        console.log("Error accessing IndexedDB database");
    };
}

//Enable or disable Unity project
const $unityCanvas = document.querySelector("#unity-canvas");
const $buttonCloseOpenDT = document.querySelector(".btn-closeOpen");
$buttonCloseOpenDT.addEventListener("click",(e)=>{

    if($unityCanvas.classList.contains("hidden")) $unityCanvas.classList.remove("hidden");
    else $unityCanvas.classList.add("hidden");
});

//SETUP OF SELECTION SPOT 
function LoadSpots(roomIDs)
{
    document.querySelector(".unity-form-content").classList("hidden");//doing visible camera view type and spots selectors

    const $spotSelection =  document.querySelector("#spots");//get form element

    // var arrayRoomIDs = ["420A_CORNER_LEFT_RIGHT","420A_BATHROOM"];//testing array

    //create array of spot from data input
    var arrayRoomIDs = roomIDs.split(",");
    arrayRoomIDs.pop();
    
    //setup array value on form element
    arrayRoomIDs.forEach((value)=>
    {
        var newOpt = document.createElement("option");
        newOpt.value = value;
        newOpt.innerHTML = value;
        $spotSelection.appendChild(newOpt);
    });
    
    //add select event
    $spotSelection.addEventListener("change",(e)=>
    {
        unityAvatarInstance.SendMessage('BrowserCallback', 'SetSpot', e.target.value);//call selection Spot method in Unity
    });
}

//SETUP OF SELECTION CAMERA VIEW
function LoadCameras(types)
{
    const $camTypesSelection =  document.querySelector("#cameraTypes");//get form element

    // var arrayCamTypes = ["Spot","First","Third"];//testing array

    //setup array value on form element
    var arrayCamTypes = types.split(",");
    
    //setup array value on form element
    arrayCamTypes.forEach((value)=>
    {
        var newOpt = document.createElement("option");
        newOpt.value = value;
        newOpt.innerHTML = value;
        $camTypesSelection.appendChild(newOpt);
    });
    
    //add select event
    $camTypesSelection.addEventListener("change",(e)=>
    {
        unityAvatarInstance.SendMessage('BrowserCallback', 'SetCameraType', e.target.value);//call selection camera view method in Unity
    });
}