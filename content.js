chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "disable-css") {
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
    sendResponse({ status: "CSS disabled successfully." });
  }

  if (message.action === "extract-css") {
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
});