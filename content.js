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
  const iframe = document.querySelector(
    'iframe[data-testid="storybook-preview-iframe"]'
  );
  if (!iframe) {
    setTimeout(waitForIframe, 1000);
    return;
  }

  iframe.addEventListener("load", () => {
    try {
      // Attendre que le contenu de l'iframe soit chargé
      setTimeout(() => {
        const count = iframe.contentWindow.eval(
          `(${countShadow.toString()})()`
        );
        console.log("Nombre d'éléments DOM :", count);

        // Créer le bouton d'ajout au panier s'il n'existe pas déjà
        if (!document.getElementById("add-to-cart-button")) {
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
            const componentName = window.location.pathname
              .split("/")
              .pop()
              .replace(".html", "");
            chrome.storage.local.get(["cart"], (result) => {
              const cart = result.cart || [];
              cart.push({ name: componentName, count });
              chrome.storage.local.set({ cart }, () => {
                button.textContent = "Ajouté au panier !";
                setTimeout(() => {
                  button.textContent = `Ajouter au panier (${count} éléments)`;
                }, 2000);
              });
            });
          });

          document.body.appendChild(button);
        }
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du comptage des éléments :", error);
    }
  });
}

if (window.location.pathname.match(/\/components\/detail\/.+\.html/)) {
  // Attendre que la page soit complètement chargée
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForIframe);
  } else {
    waitForIframe();
  }
}
