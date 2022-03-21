const $  = document.querySelector.bind(document);

console.log("Content script running...");
// Called sometime after postMessage is called
function receiveMessage(event)
{
  console.log("message received :: "+event);
  
  // Do we trust the sender of this message?
  /*
  if (event.origin.includes("localhost") || event.origin.includes("qanairy.com")){
    open_recorder();
		localStorage.test = JSON.stringify(JSON.parse(event.data).test);
		localStorage.path = JSON.stringify(JSON.parse(event.data).test.path);

		chrome.runtime.sendMessage({
        msg: "subscribe_to_platform",
        data: JSON.parse(event.data).profile
    });

    chrome.runtime.sendMessage({
        msg: "edit-test",
        data: JSON.parse(localStorage.test)
    });
    localStorage.removeItem(status);
    */
  //}

  // event.source is window.opener
  // event.data is "hello there!"

  // Assuming you've verified the origin of the received message (which
  // you must do in any case), a convenient idiom for replying to a
  // message is to call postMessage on event.source and provide
  // event.origin as the targetOrigin.
  //event.source.postMessage("hi there yourself!  the secret response " +
  //                         "is: rheeeeet!",
  //                         event.origin);
}

//window.addEventListener("message", receiveMessage, false);

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  console.log("message received :: "+msg);

  var s = document.documentElement.outerHTML; 
  response(s);

  //chrome.runtime.sendMessage({action: "getSource", source: s});
  // First, validate the message's structure.
  /*
  if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
    // Collect the necessary data. 
    // (For your specific requirements `document.querySelectorAll(...)`
    //  should be equivalent to jquery's `$(...)`.)
    var domInfo = {
      total: document.querySelectorAll('*').length,
      inputs: document.querySelectorAll('input').length,
      buttons: document.querySelectorAll('button').length,
    };

    // Directly respond to the sender (popup), 
    // through the specified callback.
    response(domInfo);
  }
  */
});
