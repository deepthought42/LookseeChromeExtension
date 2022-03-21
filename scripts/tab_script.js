var s = document.documentElement.outerHTML; 
chrome.runtime.sendMessage({action: "getSource", source: s});