const $  = document.querySelector.bind(document);

function analyzeContrast() {  
  
  console.log("sending message to color contrast");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

    chrome.tabs.sendMessage(tabs[0].id, { method: "analyzeContrast", data: "xxx" },
      function (res) {
        console.log("sending message to color contrast "+res);

        //document.getElementById("popupElement1").innerText = res.method;
        //document.getElementById("popupElement2").innerText = res.data;
        
        /* handle the response from background here */
        if (!window.chrome.runtime.lastError) {
          // message processing code goes here
        } else {
          // error handling code goes here
        }
        return true;
      }
    )
  });
  //chrome.runtime.sendMessage({action:"analyzeContrast", data:{}});
}

document.addEventListener('DOMContentLoaded', function() {
  $("#analyzeButton").addEventListener("click", analyzeContrast);
});

