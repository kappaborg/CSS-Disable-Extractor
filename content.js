let cssData = {
  inlineCSS: [],
  externalCSSLinks: []
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "disable-css") {
    console.log("Disabling CSS on the current tab...");
    
    // Store current CSS data before disabling
    cssData.inlineCSS = [];
    cssData.externalCSSLinks = [];

    document.querySelectorAll('style').forEach((style) => {
      cssData.inlineCSS.push(style.innerHTML);
    });

    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      cssData.externalCSSLinks.push(link.href);
    });

    // Remove all CSS
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());

    sendResponse({ status: "CSS disabled successfully." });
  }

  if (message.action === "extract-css") {
    console.log("Extracting CSS from the current tab...");
    
    const cssFiles = [];

    document.querySelectorAll('style').forEach((style) => {
      cssFiles.push({
        type: "inline",
        content: style.innerHTML,
      });
    });

    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      cssFiles.push({
        type: "external",
        href: link.href,
      });
    });

    sendResponse({ cssFiles: cssFiles });
  }

  if (message.action === "enable-css") {
    console.log("Enabling CSS on the current tab...");
    
    // Re-enable the CSS from stored data
    if (cssData.externalCSSLinks.length > 0) {
      cssData.externalCSSLinks.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      });
    }

    if (cssData.inlineCSS.length > 0) {
      cssData.inlineCSS.forEach((css) => {
        const style = document.createElement("style");
        style.innerHTML = css;
        document.head.appendChild(style);
      });
    }

    sendResponse({ status: "CSS enabled successfully." });
  }
});
