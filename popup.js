document.addEventListener('DOMContentLoaded', function () {
  // Disable CSS button
  document.getElementById("disable-css").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "disable-css" }, (response) => {
        console.log(response?.status || "No response from content script.");
      });
    });
  });

  // Extract CSS button
  document.getElementById("extract-css").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extract-css" }, (response) => {
        if (response && response.cssFiles) {
          console.log("Extracted CSS Files:", response.cssFiles);
        } else {
          console.error("Failed to extract CSS.");
        }

        const cssList = document.getElementById("css-list");
        cssList.innerHTML = ""; // Clear previous results
        response.cssFiles.forEach((file, index) => {
          const listItem = document.createElement("li");
          if (file.type === "inline") {
            listItem.textContent = `Inline CSS #${index + 1}`;
            listItem.addEventListener("click", () => {
              navigator.clipboard.writeText(file.content);
              alert("CSS copied to clipboard!");
            });
          } else {
            listItem.textContent = `External CSS: ${file.href}`;
            listItem.addEventListener("click", () => {
              chrome.downloads.download({
                url: file.href,
                filename: `css-file-${index + 1}.css`
              });
            });
          }
          cssList.appendChild(listItem);
        });
      });
    });
  });

  // Enable CSS button
  document.getElementById("enable-css").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "enable-css" }, (response) => {
        console.log(response?.status || "No response from content script.");
      });
    });
  });
});
