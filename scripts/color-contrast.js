//const { active } = require("auth0-chrome");
const $  = document.querySelector.bind(document);

var issue_list = [];
var active_element = null;
/**
 * Sets the values for the given issue
 * 
 * @param {*} issue 
 */
function showContrastDetails(event){
  if(active_element != null){
    active_element.classList.remove("active_issue");
  }
  active_element = this;
  active_element.classList.add("active_issue");

  $('#empty_contrast_compliance').style.display = "none";
  $('#contrast_compliance_section').style.display = "initial";

  const index = [...this.parentElement.children].indexOf(this)
  let issue = issue_list[index];

  //send message to content script with issue element_ref
  chrome.tabs.query({ active: true, currentWindow: false }, function (tabs) {

    chrome.tabs.sendMessage(tabs[0].id, { method: "viewIssue", data: issue.element_ref },
      function (res) {
        return;
      }
    )
  });


  $("#text_color").style.backgroundColor = issue.foreground_color;
  $("#text_hex_color").textContent = issue.foreground_color

  $("#bg_color").style.backgroundColor = issue.background_color;
  $("#bg_hex_color").textContent = issue.background_color

  $("#contrast").textContent = issue.contrast;

  if(issue.is_aa_compliant){
    $("#aa_success").style.display = "initial";
    $("#aa_fail").style.display = "none";
  }
  else {
    $("#aa_success").style.display = "none";
    $("#aa_fail").style.display = "initial";
  }

  if(issue.is_aaa_compliant){
    $("#aaa_success").style.display = "initial";
    $("#aaa_fail").style.display = "none";
  }
  else {
    $("#aaa_success").style.display = "none";
    $("#aaa_fail").style.display = "initial";
  }

  if(issue.type.toLowerCase() === "small text"){
    $('#non_text_element_label') == null ? "" : $('#non_text_element_label').style.display = "none";
    $('#text_element_label') == null ? "" : $('#text_element_label').style.display = "initial";
    
    $('#aa_small_text') == null ? "" : $('#aa_small_text').style.display = "initial";
    $('#aaa_small_text') == null ? "" : $('#aaa_small_text').style.display = "initial";

    $('#aa_large_text') == null ? "" : $('#aa_large_text').style.display = "none";
    $('#aaa_large_text') == null ? "" : $('#aaa_large_text').style.display = "none";
    
    $('#aa_non_text') == null ? "" : $('#aa_non_text').style.display = "none";
    $('#aaa_non_text') == null ? "" : $('#aaa_non_text').style.display = "none";
  }
  else if(issue.type.toLowerCase() === "large text"){
    $('#non_text_element_label') == null ? "" : $('#non_text_element_label').style.display = "none";
    $('#text_element_label') == null ? "" : $('#text_element_label').style.display = "initial";

    $('#aa_large_text') == null ? "" : $('#aa_large_text').style.display = "initial";
    $('#aaa_large_text') == null ? "" : $('#aaa_large_text').style.display = "initial";

    $('#aa_small_text') == null ? "" : $('#aa_small_text').style.display = "none";
    $('#aaa_small_text') == null ? "" : $('#aaa_small_text').style.display = "none";

    $('#aa_non_text') == null ? "" : $('#aa_non_text').style.display = "none";
    $('#aaa_non_text') == null ? "" : $('#aaa_non_text').style.display = "none";
  }
  else if(issue.type.toLowerCase() === "non-text"){
    $('#non_text_element_label') == null ? "" : $('#non_text_element_label').style.display = "initial";
    $('#text_element_label') == null ? "" : $('#text_element_label').style.display = "none";

    $('#aa_non_text') == null ? "" : $('#aa_non_text').style.display = "initial";
    $('#aaa_non_text') == null ? "" : $('#aaa_non_text').style.display = "initial";

    $('#aa_large_text') == null ? "" : $('#aa_large_text').style.display = "none";
    $('#aaa_large_text') == null ? "" : $('#aaa_large_text').style.display = "none";
    $('#aa_small_text') == null ? "" : $('#aa_small_text').style.display = "none";
    $('#aaa_small_text') == null ? "" : $('#aaa_small_text').style.display = "none";
    
    $('#aa_small_text').style.display = "none";
    $('#aaa_small_text').style.display = "none";
  }
}

/**
 * Constructs HTML to display the given issue as a row
 * 
 * @param {*} issue 
 * @returns 
 */
function constructContrastIssueHtml(issue){
  return "<div class='issue_row flex flex-row'>"
          + "<div class='w-30percent flex items-center text-md pl-16'>"+ issue.type +"</div>"
          + "<div class='w-60percent flex items-center justify-center text-md'>"+issue.contrast + "</div>"
          + "<input type='hidden' val='"+ issue.element_ref +"'></div>";
}

function buildContrastIssuesList(contrast_issues){
  let issue_html = "";
  if(contrast_issues === undefined){
    return "";
  }

  contrast_issues.forEach(issue => {
    issue_html += constructContrastIssueHtml(issue);

  });

  return issue_html;
}

/**
 * Analyzes the contrast of all elements on the current page.
 * 
 * Precondition:
 *   - The function is called from a context where chrome.tabs API is available.
 *   - A content script is loaded in the active tab that can respond to the "analyzeContrast" message.
 * 
 * Postcondition:
 *   - issue_list is populated with processed contrast issues.
 *   - The DOM is updated to display the contrast issues.
 *   - Click event listeners are added to each issue row.
 * 
 * Invariant:
 *   - The active tab in the current window remains unchanged.
 */
function analyzeContrast() {
  chrome.tabs.query({ active: true, currentWindow: false }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { method: "analyzeContrast", data: "xxx" },
      function (res) {
        if (res === undefined) {
          // Show error in color-contrast.html
          $("#contrast_issues").innerHTML = '<p class="error">An error occurred while analyzing contrast. Please try again.</p>';
          return;
        }

        issue_list = processContrastIssues(res);
        $("#contrast_issues").innerHTML = buildContrastIssuesList(issue_list);

        const issues = document.querySelectorAll('.issue_row');
        
        if (issues && issues.length > 0) {
          issues.forEach(issue => {
            issue.addEventListener('click', showContrastDetails);
          });
        } else {
          // Show error in color-contrast.html
          $("#contrast_issues").innerHTML = '<p class="error">No contrast issues found or an error occurred.</p>';
        }
        
        if (!window.chrome.runtime.lastError) {
          // message processing code goes here
        } else {
          // error handling code goes here
        }
        return true;
      }
    );
  });
}

/**
 * Processes contrast issues to add WCAG violation information and color recommendations.
 * 
 * Precondition:
 *   - issues is an array of contrast issue objects, each containing at least:
 *     {
 *       is_aa_compliant: boolean,
 *       foreground_color: string,
 *       background_color: string
 *     }
 * 
 * Postcondition:
 *   - Returns a new array where each non-compliant issue includes:
 *     - wcagViolation: string explaining the WCAG 2.1 AA violation
 *     - recommendations: array of 3 compliant color pair objects
 * 
 * Invariant:
 *   - The original issues array remains unchanged.
 *   - The length of the returned array is equal to the length of the input array.
 */
function processContrastIssues(issues) {
  return issues.map(issue => {
    if (!issue.is_aa_compliant) {
      issue.wcagViolation = "This element does not meet WCAG 2.1 AA requirements for color contrast.";
      issue.recommendations = generateCompliantColorPairs(issue.foreground_color, issue.background_color);
    }
    return issue;
  });
}

/**
 * Generates three color pairs that are compliant with WCAG 2.1 AA requirements.
 * 
 * Precondition:
 *   - fgColor and bgColor are valid color strings (e.g., "#RRGGBB").
 * 
 * Postcondition:
 *   - Returns an array of 3 objects, each containing:
 *     {
 *       foreground: string (a color value),
 *       background: string (a color value)
 *     }
 *   - Each returned color pair meets WCAG 2.1 AA contrast requirements.
 * 
 * Invariant:
 *   - The input colors remain unchanged.
 */
function generateCompliantColorPairs(fgColor, bgColor) {
  // This is a placeholder function. You'll need to implement the actual color generation logic.
  return [
    { foreground: adjustColor(fgColor, 10), background: adjustColor(bgColor, -10) },
    { foreground: adjustColor(fgColor, -10), background: adjustColor(bgColor, 10) },
    { foreground: adjustColor(fgColor, 20), background: adjustColor(bgColor, -20) },
  ];
}

/**
 * Adjusts a color by a given amount to potentially improve contrast.
 * 
 * Precondition:
 *   - color is a valid color string (e.g., "#RRGGBB").
 *   - amount is a number representing the adjustment intensity.
 * 
 * Postcondition:
 *   - Returns a new color string representing the adjusted color.
 * 
 * Invariant:
 *   - The input color string remains unchanged.
 *   - The returned color is a valid color string.
 */
function adjustColor(color, amount) {
  // This is a placeholder function. You'll need to implement the actual color adjustment logic.
  return color; // Return the original color for now
}

/**
 * Displays the URL of the current active tab.
 * 
 * Precondition:
 *   - The function is called from a context where chrome.tabs API is available.
 * 
 * Postcondition:
 *   - The URL of the current active tab is displayed in the #current-url element.
 * 
 * Invariant:
 *   - The active tab in the current window remains unchanged.
 */
function displayCurrentUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].url) {
      $('#current-url').textContent = tabs[0].url;
    } else {
      $('#current-url').textContent = 'Unable to retrieve URL';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  $("#analyzeContrastButton").addEventListener("click", analyzeContrast);
  
  // Display the current URL when the popup is opened
  displayCurrentUrl();

  // Tab functionality
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');

      // Hide all tab contents
      tabContents.forEach(content => content.style.display = 'none');

      // Show the corresponding tab content
      const tabId = tab.getAttribute('data-tab');
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.style.display = 'block';
      }
    });
  });

  // Set default active tab (Contrast)
  document.querySelector('.tab[data-tab="contrast-tab"]').click();
});