const $  = document.querySelector.bind(document);

function isScript(element){
  return element.tagName.toLowerCase() === "script";
}

/**
 * Retrieves set of elements that own text. Text ownership is defined as having text within an
 *   an element that belongs to that element and not any of it's children. 
 */
function getElementsThatOwnText(){
  var elements = document.body.getElementsByTagName("*");
  var text_elements = [];

  for(var i=0; i < elements.length; i++) {
    if(!isScript(elements[i]) && elements[i].textContent.length){
      text_elements.push(elements[i]);
    }
  }

  return text_elements;
}

/**
 * Computes the contrast between 2 colors
 * @param {*} color1 
 * @param {*} color2 
 */
function calculateContrast(color1, color2){
  console.log("color 1 :: "+color1);
  console.log("color 2 :: "+color2);
}

/**
 * Checks if contrast meets AA compliance given font size and weight
 * 
 * @param {*} contrast 
 * @param {*} font_size 
 * @param {*} font_weight 
 */
function getIsAACompliant(contrast, font_size, font_weight){
  return true;
}

/**
 * Checks if contrast meets AAA compliance given font size and weight
 * 
 * @param {*} contrast 
 * @param {*} font_size 
 * @param {*} font_weight 
 */
function getIsAAACompliant(contrast, font_size, font_weight){
  return false;
}

function getTextSizeString(font_size){
  if(font_size >= 18){
    return "Large Text";
  }

  return "Small Text";
}

/**
 * Checks all text elements for color contrast issues
 * @param {*} event 
 */
function reviewTextContrast()
{
  console.log("checking text elements for color contrast issues");
  var contrast_issues = [];

  // GET ALL ELEMENTS THAT OWN TEXT
  var elements = getElementsThatOwnText()
  var idx = 0;
  for(var i=0; i< elements.length; i++){
    var element = elements[i];
    var element_style = window.getComputedStyle(element);
    //  GET TEXT COLOR
    var text_color = element_style.color;
    //  GET BACKGROUND COLOR
    var bg_color = element_style.backgroundColor;
    //  RETRIEVE FONT SIZE
    var font_size = element_style.font_size;
    //  RETRIEVE FONT WEIGHT
    var font_weight = element_style.font_weight

    //  CALCULATE CONTRAST VALUE
    var contrast = calculateContrast(text_color, bg_color);
    //  CHECK IF ELEMENT IS AA COMPLIANT
    var is_aa_compliant = getIsAACompliant(contrast, font_size, font_weight);
    //  CHECK IF ELEMENT IS AAA COMPLIANT
    var is_aaa_compliant = getIsAAACompliant(contrast, font_size, font_weight);

    //  IF NOT AA OR AAA COMPLAINT THEN ASSIGN CLASS TO EACH ELEMENT WITH ELEMENT ID SUCH THAT IT HAS THE FORMAT "TEXT_ELEMENT_$INDEX"
    if(!is_aa_compliant || !is_aaa_compliant){
      element.classList.add("text_element_"+idx);

      //  CREATE NEW CONTRAST ISSUE
      let issue = new ContrastIssue(text_color, bg_color, contrast, getTextSizeString(font_size), "text_element_"+idx, is_aa_compliant, is_aaa_compliant);
      //  ADD CONTRAST ISSUE TO ISSUE LIST
      contrast_issues.push(issue);
    }
    idx = idx + 1;  
  }

  let text_issue = new ContrastIssue("#AAAAAA", "#111111", 2.4, "Large Text", "Text_element_1", true, false);
  let text_issue1 = new ContrastIssue("#ABABAB", "#C34FE2", 2.4, "Small Text", "text_element_2", false, false);

  //return [text_issue, text_issue1];
  return contrast_issues;
}

/**
 * Checks all non text elements for color contrast issues
 * @param {*} event 
 */
 function reviewNonTextContrast()
 {
   console.log("Checking Non-Text elements for contrast issues");
   
   let issue = new ContrastIssue("#FFFFFF", "#000000", 2.4, "button", "non_text_3", false, false);
   return issue;
 }

//window.addEventListener("message", receiveMessage, false);

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  console.log("message received :: "+msg);

  var s = document.documentElement.outerHTML; 

  var text_contrast_issues = reviewTextContrast();
  var non_text_contrast_issues = reviewNonTextContrast();

  let contrast_issues = text_contrast_issues;
  contrast_issues.push(non_text_contrast_issues);
  response(contrast_issues);

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

class ContrastIssue {
  constructor(foreground, background, contrast, type, element_ref, is_aa_compliant, is_aaa_compliant){
    this.foreground_color = foreground;
    this.background_color = background;
    this.contrast = contrast;
    this.type = type;
    this.element_ref = element_ref;
    this.is_aa_compliant = is_aa_compliant;
    this.is_aaa_compliant = is_aaa_compliant;
  }
}