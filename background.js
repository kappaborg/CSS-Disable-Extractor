// Background script to manage extension functionality
chrome.runtime.onInstalled.addListener(() => {
  console.log("CSS Control Extension installed.");
});

// Listener to handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "disable-css":
      console.log("Disabling CSS on the current tab...");
      disableCssOnActiveTab(sendResponse);
      return true; // Required for async sendResponse
    case "enable-css":
      console.log("Enabling CSS on the current tab...");
      enableCssOnActiveTab(sendResponse);
      return true; // Required for async sendResponse
    case "extract-css":
      console.log("Extracting CSS from the current tab...");
      extractCssFromActiveTab(sendResponse);
      return true; // Required for async sendResponse
    default:
      console.error(`Unknown action: ${message.action}`);
      sendResponse({ error: "Unknown action" });
  }
});

// Disable all CSS styles on the current active tab
async function disableCssOnActiveTab(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ error: "No active tab found" });
      return;
    }

    const tabId = tabs[0].id;

    // Execute a script to remove all CSS
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Store external CSS URLs and inline CSS before removing them
        const cssData = {
          inlineCSS: [],
          externalCSSLinks: [],
        };

        // Store inline styles
        document.querySelectorAll('style').forEach((style) => {
          cssData.inlineCSS.push(style.innerHTML);
        });

        // Store external stylesheets
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          cssData.externalCSSLinks.push(link.href);
        });

        // Remove all CSS
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());

        // Save the CSS data to localStorage (or you can use chrome.storage)
        localStorage.setItem('cssData', JSON.stringify(cssData));
      },
    });

    sendResponse({ status: "CSS disabled successfully." });
  } catch (error) {
    console.error("Error disabling CSS:", error);
    sendResponse({ error: "Failed to disable CSS" });
  }
}

// Enable the CSS on the current active tab
async function enableCssOnActiveTab(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ error: "No active tab found" });
      return;
    }

    const tabId = tabs[0].id;

    // Retrieve stored CSS data from localStorage (or chrome.storage)
    const cssData = JSON.parse(localStorage.getItem('cssData') || '{}');

    // If no CSS data is stored, respond with an error
    if (!cssData.inlineCSS && !cssData.externalCSSLinks) {
      sendResponse({ error: "No CSS data found to re-enable" });
      return;
    }

    // Re-enable the CSS on the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (storedData) => {
        // Recreate the <link> elements for external CSS
        storedData.externalCSSLinks.forEach((href) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          document.head.appendChild(link);
        });

        // Recreate the <style> elements for inline CSS
        storedData.inlineCSS.forEach((css) => {
          const style = document.createElement("style");
          style.innerHTML = css;
          document.head.appendChild(style);
        });
      },
      args: [cssData],
    });

    sendResponse({ status: "CSS enabled successfully." });
  } catch (error) {
    console.error("Error enabling CSS:", error);
    sendResponse({ error: "Failed to enable CSS" });
  }
}

// Extract all CSS files (inline and external) from the active tab
async function extractCssFromActiveTab(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      sendResponse({ error: "No active tab found" });
      return;
    }

    const tabId = tabs[0].id;

    // Execute a script to get inline and external CSS
    const results = await chrome.scripting.executeScript({
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
    });

    if (results && results[0] && results[0].result) {
      sendResponse({ cssFiles: results[0].result });
    } else {
      sendResponse({ cssFiles: [] });
    }
  } catch (error) {
    console.error("Error extracting CSS:", error);
    sendResponse({ error: "Failed to extract CSS" });
  }
}
