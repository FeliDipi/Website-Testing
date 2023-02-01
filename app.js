function LoadImage(key) {

    window.alert(key);
    console.log(key);

    // IndexedDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
        dbVersion = 21;

    let db;
    // Create/open database
    var request = indexedDB.open("/idbfs", dbVersion)
    request.onsuccess = function(e){

        console.log("Success creating/accessing IndexedDB database");

        db = request.result;
        var transaction = db.transaction(["FILE_DATA"], IDBTransaction.READ_WRITE);
        transaction.objectStore("FILE_DATA").get(key).onsuccess = function (event) {
            var imgFile = event.target.result;
            console.log(imgFile);

            var blob = new Blob([imgFile.contents], { type: "image/png" });

            // Create and revoke ObjectURL
            var imgURL = (window.URL) ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);

            // Set img src to ObjectURL
            var img = document.getElementById("display_image");
            img.setAttribute("src", imgURL);
        };
    }

    request.onerror = function (event) {
        console.log("Error creating/accessing IndexedDB database");
    };
  }