chrome.tabs.executeScript(null, { file: "content.js" });
var IS_LOADING = false;
document.querySelector('#download-btn').onclick = function () {
    chrome.tabs.executeScript(null, { code: "collectData()" });
};