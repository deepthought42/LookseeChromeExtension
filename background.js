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

// This script runs in the background
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content_script.js']
  });
});