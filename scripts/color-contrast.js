/**
 * Popup UI logic for the Look-see color contrast analyzer.
 */

'use strict';

const $ = document.querySelector.bind(document);

// The tab ID of the inspected page, passed from background.js via query param.
const inspectedTabId = parseInt(new URLSearchParams(window.location.search).get('tabId'), 10);

let issueList = [];
let activeElement = null;

/**
 * Sends a message to the inspected page's content script.
 */
function sendToContentScript(message, callback) {
  if (!inspectedTabId) return;
  chrome.tabs.sendMessage(inspectedTabId, message, callback || function () {});
}

/**
 * Sets visibility of type-specific compliance labels.
 */
function setComplianceDisplay(type) {
  const isSmall = type === 'small text';
  const isLarge = type === 'large text';
  const isNonText = type === 'non-text';

  const toggle = (selector, visible) => {
    const el = $(selector);
    if (el) el.style.display = visible ? 'initial' : 'none';
  };

  toggle('#text_element_label', !isNonText);
  toggle('#non_text_element_label', isNonText);
  toggle('#aa_small_text', isSmall);
  toggle('#aaa_small_text', isSmall);
  toggle('#aa_large_text', isLarge);
  toggle('#aaa_large_text', isLarge);
  toggle('#aa_non_text', isNonText);
  toggle('#aaa_non_text', isNonText);
}

/**
 * Displays detail panel for a selected contrast issue.
 */
function showContrastDetails() {
  if (activeElement) {
    activeElement.classList.remove('active_issue');
  }
  activeElement = this;
  activeElement.classList.add('active_issue');

  $('#empty_contrast_compliance').style.display = 'none';
  $('#contrast_compliance_section').style.display = 'initial';

  const index = Array.prototype.indexOf.call(this.parentElement.children, this);
  const issue = issueList[index];

  // Highlight the element on the inspected page
  sendToContentScript({ method: 'viewIssue', data: issue.element_ref });

  // Update color previews
  $('#text_color').style.backgroundColor = issue.foreground_color;
  $('#text_hex_color').textContent = issue.foreground_color;
  $('#bg_color').style.backgroundColor = issue.background_color;
  $('#bg_hex_color').textContent = issue.background_color;
  $('#contrast').textContent = issue.contrast;

  // Update compliance icons
  $('#aa_success').style.display = issue.is_aa_compliant ? 'initial' : 'none';
  $('#aa_fail').style.display = issue.is_aa_compliant ? 'none' : 'initial';
  $('#aaa_success').style.display = issue.is_aaa_compliant ? 'initial' : 'none';
  $('#aaa_fail').style.display = issue.is_aaa_compliant ? 'none' : 'initial';

  setComplianceDisplay(issue.type.toLowerCase());
}

/**
 * Builds an HTML string for an issue row.
 */
function constructContrastIssueHtml(issue) {
  const typeEscaped = issue.type.replace(/</g, '&lt;');
  return '<div class="issue_row flex flex-row">'
    + '<div class="w-30percent flex items-center text-md pl-16">' + typeEscaped + '</div>'
    + '<div class="w-60percent flex items-center justify-center text-md">' + issue.contrast + '</div>'
    + '</div>';
}

/**
 * Renders the full issues list HTML.
 */
function buildContrastIssuesList(issues) {
  if (!issues || issues.length === 0) return '';
  let html = '';
  for (let i = 0; i < issues.length; i++) {
    html += constructContrastIssueHtml(issues[i]);
  }
  return html;
}

/**
 * Triggers contrast analysis on the inspected tab.
 */
function analyzeContrast() {
  sendToContentScript({ method: 'analyzeContrast' }, function (res) {
    if (chrome.runtime.lastError || !res) return;
    issueList = res;
    $('#contrast_issues').innerHTML = buildContrastIssuesList(res);

    const rows = document.querySelectorAll('.issue_row');
    for (let i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', showContrastDetails);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  $('#analyzeButton').addEventListener('click', analyzeContrast);
});
