console.log("🔧 Background script chargé");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url.includes("design-system.docs.pole-emploi.infra/components/detail/")
  ) {
    console.log("📥 Injection du script dans l'onglet", tabId);
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });
  }
});
