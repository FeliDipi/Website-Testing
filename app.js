function ExecuteEvent(event)
{
    //SDK LOADED, WEB PAGE ALREADY FOR USING
    const LoadPage = ()=>
    {
        console.log("SDK LOADED");
        const $loadingPageContent = document.querySelector(".load-page-content");
        $loadingPageContent.classList.add("hidden-opacity");
    }

    //LOAD AVATAR CAPTURE CREATED BY UNITY
    const LoadImage = (key)=> 
    {
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

                $loadingIcon.classList.add("hidden");
            };
        }

        request.onerror = function (event) {
            console.log("Error accessing IndexedDB database");
        };
    }

    const LoadSimulationControl = () =>
    {
        const $btnPlay = document.querySelector("#btn-play-simulation");
        const $btnStop = document.querySelector("#btn-stop-simulation");
        const $btnAdd= document.querySelector("#btn-add-simulation");

        $btnPlay.addEventListener("click",(e)=>{
            var event=
            {
                key:"SimulationControllerMessage",
                data:"play"
            }

            var eventStr = JSON.stringify(event);

            unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call play simulation method in Unity
        });

        $btnStop.addEventListener("click",(e)=>{
            var event=
            {
                key:"SimulationControllerMessage",
                data:"stop"
            }

            var eventStr = JSON.stringify(event);

            unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call stop simulation method in Unity
        });

        $btnAdd.addEventListener("click",(e)=>{
            var event=
            {
                key:"SimulationMessage",
                data:
                {
                    id:"Bed",
                    state:"inprogress",
                    message:"Wipe",
                    duration:5
                }
            }

            var eventStr = JSON.stringify(event);

            unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call stop simulation method in Unity
        });
    }

    //SETUP OF SELECTION SPOT 
    const LoadSpots = (roomIDs)=>
    {
        const $simulationBtnContent = document.querySelector(".simulation-btns-content");
        $simulationBtnContent.classList.remove("hidden");//doing visible btn for control the simulation

        LoadSimulationControl();

        const $unityFormContent = document.querySelector(".unity-form-content");
        $unityFormContent.classList.remove("hidden");//doing visible camera view type and spots selectors

        const $spotSelection =  document.querySelector("#spots");//get form element

        //create array of spot from data input
        var arrayRoomIDs = JSON.parse(roomIDs);
        
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
            var event=
            {
                key:"ChangeSpotMessage",
                data:e.target.value
            }

            var eventStr = JSON.stringify(event);

            unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call selection Spot method in Unity
        });
    }

    //SETUP OF SELECTION CAMERA VIEW
    const LoadCameras = (types)=>
    {
        const $camTypesSelection =  document.querySelector("#cameraTypes");//get form element
        
        arrayCamTypes = JSON.parse(types);

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
            var event=
            {
                key:"ChangeCameraMessage",
                data:e.target.value
            }

            var eventStr = JSON.stringify(event);

            unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);//call selection camera view method in Unity
        });
    }

    var eventJson = JSON.parse(event);

    switch(eventJson.key)
    {
        case "cameraTypes": LoadCameras(eventJson.data);
            break;
        case "spotsIDs": LoadSpots(eventJson.data);
            break;
        case "loadCapture": LoadImage(eventJson.data);
            break;
        case "loadedSDK": LoadPage();
            break;
        default:
            console.log(`Event with event key: ${eventJson.key} not found`);
            break;
    }
}

//INITIALIZE THE WEBSITE FUNCTIONS WHEN THE UNITY PROJECT IS ALREADY
const Initialize = ()=>
{
    console.log("Initialize Web Site");

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
    
            var event=
            {
                key:"CaptureMessage",
                data:captureURL
            }

            var eventStr = JSON.stringify(event);
    
            $loadingIcon.classList.remove("hidden");
            unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);
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
                    $videoCapture.classList.add("hidden");//disable webcam
                    contextCapture.drawImage($videoCapture,0,0,$canvasCapture.width,$canvasCapture.height);//draw capture on canvas element
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
    
                        var event=
                        {
                            key:"CaptureMessage",
                            data:realtimeCaptureURL
                        }

                        var eventStr = JSON.stringify(event);
    
                        unityAvatarInstance.SendMessage('MessageHandler', 'SendNewEvent', eventStr);
                    },'image/jpeg');
                },3000);
    
            });
        }
    })
    
    //Enable or disable Unity project
    const $unityCanvas = document.querySelector("#unity-canvas");
    const $buttonCloseOpenDT = document.querySelector(".btn-closeOpen");
    $buttonCloseOpenDT.addEventListener("click",(e)=>{
    
        if($unityCanvas.classList.contains("hidden")) $unityCanvas.classList.remove("hidden");
        else $unityCanvas.classList.add("hidden");
    });
}

Initialize();
