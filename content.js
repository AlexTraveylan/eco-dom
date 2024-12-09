const countShadom = () => {
  const countElements = (element) => {
    let count = 1;
    Array.from(element.children).forEach((child) => {
      count += countElements(child);
    });

    if (element.shadowRoot) {
      Array.from(element.shadowRoot.children).forEach((sChild) => {
        count += countElements(sChild);
      });
    }
    return count;
  };

  return countElements(document.body);
};

function initDOMCounter() {
  if (window.location.pathname.match(/\/components\/detail\/.+\.html/)) {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.addEventListener("load", () => {
        const count = iframe.contentWindow.eval(
          `(${countShadom.toString()})()`
        );

        // Créer le bouton d'ajout au panier
        const button = document.createElement("button");
        button.textContent = `Ajouter au panier (${count} éléments)`;
        button.style.position = "fixed";
        button.style.top = "10px";
        button.style.right = "10px";
        button.style.zIndex = "9999";

        button.addEventListener("click", () => {
          const componentName = window.location.pathname
            .split("/")
            .pop()
            .replace(".html", "");
          chrome.storage.local.get(["cart"], (result) => {
            const cart = result.cart || [];
            cart.push({ name: componentName, count });
            chrome.storage.local.set({ cart });
          });
        });

        document.body.appendChild(button);
      });
    }
  }
}

initDOMCounter();
