/*
import env from "env.js"
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM();

console.log(env)
*/

chrome.runtime.onInstalled.addListener(() => {
    
});

chrome.action.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL("color-contrast.html"),
    type: "popup",
    height: 700,
    width: 400
  });
});

/*
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("color-contrast.html",
    {  frame: "none",
       id: "LookseeExtension",
       innerBounds: {
         width: 360,
         height: 300,
         left: 600,
         minWidth: 220,
         minHeight: 220
      }
    }
  );
})
*/
/*
chrome.action.onClicked.addListener(tab => {
  console.log("background received message :: "+request);
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    console.log("querying tab");
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id, allFrames: true},
      files: ['content_script.js'],
    });
  });
});
*/

/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("background received message :: "+request);
  if (request.method == "analyzeContrast") {
      console.log("request received :" +request.data)
      
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        console.log("querying tab");
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id, allFrames: true},
          files: ['scripts/tab_script.js'],
        });
      });

      sendResponse({ method: "contrast_list", data: ["list item 1", "list item 2"] })
  }
  if (request.action == "getSource") {
      this.pageSource = request.source;
      var title = this.pageSource.match(/<title[^>]*>([^<]+)<\/title>/)[1];
      alert(title)
  }
  else if(request.message == "analyzeContrast") {
    //chrome.notifications.create('worktimer-notification', request.options, function() { });
    console.log("analyzing contrast");
    sendResponse();
  }
});
*/