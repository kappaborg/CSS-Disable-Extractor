// Background script to manage extension functionality

chrome.runtime.onInstalled.addListener(() => {
    console.log("CSS Control Extension installed.");
  });
  
  // Listener to handle messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "disable-css") {
      console.log("Disabling CSS on the current tab...");
      disableCssOnActiveTab(sendResponse);
      return true; // Required for async sendResponse
    }
  
    if (message.action === "extract-css") {
      console.log("Extracting CSS from the current tab...");
      extractCssFromActiveTab(sendResponse);
      return true; // Required for async sendResponse
    }
  });
  
  // Disable all CSS styles on the current active tab
  function disableCssOnActiveTab(sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
  
      const tabId = tabs[0].id;
  
      // Execute a script to remove all CSS
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
          },
        },
        () => {
          sendResponse({ status: "CSS disabled successfully." });
        }
      );
    });
  }
  
  // Extract all CSS files (inline and external) from the active tab
  function extractCssFromActiveTab(sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
  
      const tabId = tabs[0].id;
  
      // Execute a script to get inline and external CSS
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => {
            const cssFiles = [];
  
            // Extract inline styles
            document.querySelectorAll('style').forEach((style) => {
              cssFiles.push({
                type: "inline",
                content: style.innerHTML,
              });
            });
  
            // Extract external stylesheets
            document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
              cssFiles.push({
                type: "external",
                href: link.href,
              });
            });
  
            return cssFiles;
          },
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error("Error extracting CSS:", chrome.runtime.lastError.message);
            sendResponse({ error: chrome.runtime.lastError.message });
            return;
          }
  
          if (results && results[0] && results[0].result) {
            sendResponse({ cssFiles: results[0].result });
          } else {
            sendResponse({ cssFiles: [] });
          }
        }
      );
    });
  }