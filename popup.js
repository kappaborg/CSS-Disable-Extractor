document.addEventListener('DOMContentLoaded', function () {
  // Disable CSS
  document.getElementById("disable-css").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "disable-css" }, (response) => {
        console.log(response?.status || "No response from content script.");
      });
    });
  });

  // Extract CSS
  document.getElementById("extract-css").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extract-css" }, (response) => {
        if (!response || !response.cssFiles) {
          console.error("Failed to extract CSS.");
          return;
        }

        console.log("Extracted CSS Files:", response.cssFiles);
        const cssList = document.getElementById("css-list");
        cssList.innerHTML = ""; // Clear previous output

        response.cssFiles.forEach((file, index) => {
          const listItem = document.createElement("li");
          
          if (file.type === "inline") {
            listItem.textContent = `Inline CSS #${index + 1}`;
            listItem.dataset.content = file.content;
          } else {
            listItem.textContent = `External CSS: ${file.href}`;
            listItem.dataset.content = file.href;
          }

          listItem.addEventListener("click", () => {
            navigator.clipboard.writeText(listItem.dataset.content);
            showCopyMessage(listItem);
          });

          cssList.appendChild(listItem);
        });
      });
    });
  });

  // Enable CSS
  document.getElementById("enable-css").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "enable-css" }, (response) => {
        console.log(response?.status || "No response from content script.");
      });
    });
  });

  function showCopyMessage(element) {
    const message = document.createElement("span");
    message.className = "copy-message";
    message.textContent = "Copied!";
    element.appendChild(message);
    message.style.display = "inline";

    setTimeout(() => {
      message.remove();
    }, 1000);
  }
});
