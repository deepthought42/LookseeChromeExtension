/**
 * Content script for Look-see Chrome Extension.
 * Injected into web pages to analyze color contrast for WCAG compliance.
 * Depends on lib/contrast-utils.js being loaded first.
 */

'use strict';

let previousHighlight = null;

/**
 * Checks whether an element or any ancestor is hidden from view.
 */
function isHidden(element) {
  let node = element;
  while (node) {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.maxHeight === '0px') {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

/**
 * Retrieves elements that directly own text content (not inherited from children).
 * Uses a Set for O(1) duplicate text lookups instead of array scanning.
 */
function getElementsThatOwnText() {
  const allElements = document.body.getElementsByTagName('*');
  const textElements = [];
  const seenText = new Set();

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;

    const lines = el.textContent.split(/\r?\n/);
    const scrubbed = [];
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].trim().length > 0) {
        scrubbed.push(lines[j]);
      }
    }

    if (scrubbed.length === 1) {
      const text = el.textContent.trim();
      if (!seenText.has(text)) {
        textElements.push(el);
        seenText.add(text);
      }
    }
  }

  return textElements;
}

/**
 * Retrieves visible button elements with non-transparent backgrounds.
 */
function getButtonElements() {
  const buttons = document.body.querySelectorAll('button, .button');
  const elements = [];

  for (let i = 0; i < buttons.length; i++) {
    const el = buttons[i];
    if (!isHidden(el) && getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)') {
      elements.push(el);
    }
  }

  return elements;
}

/**
 * Walks up the DOM to find the first ancestor with a non-transparent background.
 */
function getBackgroundColor(element) {
  let node = element;
  while (node) {
    if (getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return getComputedStyle(node).backgroundColor;
    }
    node = node.parentElement;
  }
  return 'rgb(255, 255, 255)';
}

/**
 * Finds the nearest ancestor with a different, non-transparent background color.
 */
function findParentWithDifferentBackground(element) {
  const elementBg = getComputedStyle(element).backgroundColor;
  let parent = element.parentElement;

  while (parent) {
    const parentBg = getComputedStyle(parent).backgroundColor;
    if (parentBg !== elementBg && parentBg !== 'rgba(0, 0, 0, 0)') {
      return parentBg;
    }
    parent = parent.parentElement;
  }

  return elementBg === 'rgba(0, 0, 0, 0)' ? 'rgb(255, 255, 255)' : elementBg;
}

/**
 * Scans all text-owning elements for contrast issues.
 */
function reviewTextContrast() {
  const issues = [];
  const elements = getElementsThatOwnText();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const style = getComputedStyle(element);
    const textColor = style.color;
    const bgColor = getBackgroundColor(element);
    const fontSize = parseInt(style.fontSize, 10) * (72.0 / 96.0);
    const fontWeight = parseInt(style.fontWeight, 10) || 400;

    const contrast = roundContrast(calculateContrast(textColor, bgColor));
    const isAA = getIsAACompliant(contrast, fontSize, fontWeight);
    const isAAA = getIsAAACompliant(contrast, fontSize, fontWeight);

    if (!isAA || !isAAA) {
      const className = 'text_element_' + i;
      element.classList.add(className);
      issues.push({
        foreground_color: rgbToHex(textColor),
        background_color: rgbToHex(bgColor),
        contrast: contrast,
        type: getTextSizeString(fontSize, fontWeight),
        element_ref: className,
        is_aa_compliant: isAA,
        is_aaa_compliant: isAAA
      });
    }
  }

  return issues;
}

/**
 * Scans button elements for contrast issues against their parent background.
 */
function reviewNonTextContrast() {
  const issues = [];
  const elements = getButtonElements();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elementColor = getComputedStyle(element).backgroundColor;
    const bgColor = findParentWithDifferentBackground(element);
    const contrast = roundContrast(calculateContrast(elementColor, bgColor));
    const isAA = getIsNonTextAACompliant(contrast);
    const isAAA = getIsNonTextAAACompliant(contrast);

    if (!isAA || !isAAA) {
      const className = 'non_text_' + i;
      element.classList.add(className);
      issues.push({
        foreground_color: rgbToHex(elementColor),
        background_color: rgbToHex(bgColor),
        contrast: contrast,
        type: 'non-text',
        element_ref: className,
        is_aa_compliant: isAA,
        is_aaa_compliant: isAAA
      });
    }
  }

  return issues;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.method === 'analyzeContrast') {
    const textIssues = reviewTextContrast();
    const nonTextIssues = reviewNonTextContrast();
    response(textIssues.concat(nonTextIssues));
  } else if (msg.method === 'viewIssue') {
    if (previousHighlight) {
      previousHighlight.style.border = '';
    }
    const el = document.querySelector('.' + msg.data);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.border = '4px solid red';
      previousHighlight = el;
    }
    response(true);
  }
});
