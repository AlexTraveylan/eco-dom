(() => {
  console.log("🎯 Test d'exécution immédiate de content.js");
  // Créer un élément visuel pour confirmer le chargement
  const testDiv = document.createElement("div");
  testDiv.textContent = "Extension chargée";
  testDiv.style.position = "fixed";
  testDiv.style.top = "0";
  testDiv.style.left = "0";
  testDiv.style.backgroundColor = "red";
  testDiv.style.color = "white";
  testDiv.style.padding = "5px";
  testDiv.style.zIndex = "99999";
  document.body.appendChild(testDiv);
})();

const countShadow = () => {
  const countElements = (element) => {
    if (!element) return 0;

    let count = 1;
    if (element.children) {
      Array.from(element.children).forEach((child) => {
        count += countElements(child);
      });
    }

    if (element.shadowRoot) {
      Array.from(element.shadowRoot.children).forEach((sChild) => {
        count += countElements(sChild);
      });
    }
    return count;
  };

  return countElements(document.body);
};

function waitForIframe() {
  console.log("🔍 Recherche de l'iframe...");
  const iframe = document.querySelector(
    'iframe[data-testid="storybook-preview-iframe"]'
  );

  if (!iframe) {
    console.log("❌ Iframe non trouvée, nouvelle tentative dans 1s");
    setTimeout(waitForIframe, 1000);
    return;
  }

  console.log("✅ Iframe trouvée !");

  // On retire l'ancien listener s'il existe
  iframe.removeEventListener("load", iframeLoadHandler);

  // On définit le handler séparément pour pouvoir le remove
  function iframeLoadHandler() {
    console.log("🔄 Iframe chargée, traitement en cours...");
    try {
      // Attendre que le contenu de l'iframe soit complètement chargé
      setTimeout(() => {
        console.log("⚙️ Évaluation du nombre d'éléments...");
        const count = iframe.contentWindow.eval(
          `(${countShadow.toString()})()`
        );
        console.log("📊 Nombre d'éléments DOM :", count);

        // Supprimer l'ancien bouton s'il existe
        const oldButton = document.getElementById("add-to-cart-button");
        if (oldButton) {
          console.log("🗑️ Suppression de l'ancien bouton");
          oldButton.remove();
        }

        console.log("🎨 Création du nouveau bouton");
        const button = document.createElement("button");
        button.id = "add-to-cart-button";
        button.textContent = `Ajouter au panier (${count} éléments)`;
        button.style.position = "fixed";
        button.style.top = "10px";
        button.style.right = "10px";
        button.style.zIndex = "9999";
        button.style.padding = "10px";
        button.style.backgroundColor = "#4CAF50";
        button.style.color = "white";
        button.style.border = "none";
        button.style.borderRadius = "4px";
        button.style.cursor = "pointer";

        button.addEventListener("click", () => {
          console.log("🛒 Clic sur le bouton d'ajout au panier");
          const componentName = window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");
          chrome.storage.local.get(["cart"], (result) => {
            const cart = result.cart || [];
            cart.push({ name: componentName, count });
            chrome.storage.local.set({ cart }, () => {
              console.log("✅ Composant ajouté au panier");
              button.textContent = "Ajouté au panier !";
              setTimeout(() => {
                button.textContent = `Ajouter au panier (${count} éléments)`;
              }, 2000);
            });
          });
        });

        document.body.appendChild(button);
        console.log("✅ Bouton ajouté à la page");
      }, 1000);
    } catch (error) {
      console.error("❌ Erreur lors du traitement :", error);
    }
  }

  // Ajout du nouveau listener
  iframe.addEventListener("load", iframeLoadHandler);

  // Déclencher manuellement le handler si l'iframe est déjà chargée
  if (
    iframe.contentWindow &&
    iframe.contentWindow.document.readyState === "complete"
  ) {
    console.log("📍 Iframe déjà chargée, exécution immédiate");
    iframeLoadHandler();
  }
}

console.log("🚀 Script content.js démarré");
if (window.location.pathname.match(/\/components\/detail\/.+\.html/)) {
  console.log("📄 Page de détail de composant détectée");
  if (document.readyState === "loading") {
    console.log(
      "⏳ Document en cours de chargement, attente du DOMContentLoaded"
    );
    document.addEventListener("DOMContentLoaded", waitForIframe);
  } else {
    console.log("📑 Document déjà chargé, exécution immédiate");
    waitForIframe();
  }
}
