let currentCount = 0;

// Fonction pour compter les éléments DOM
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

// Fonction pour mettre à jour l'affichage du panier
function updateCartDisplay() {
  chrome.storage.local.get(["cart"], (result) => {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";

    const cart = result.cart || [];
    cart.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      itemDiv.innerHTML = `
        <span>${item.name}</span>
        <span>${item.count} éléments</span>
        <button class="remove-item" data-index="${index}">×</button>
      `;
      cartItems.appendChild(itemDiv);
    });
  });
}

// Au chargement de la popup
document.addEventListener("DOMContentLoaded", () => {
  const calculateButton = document.getElementById("calculate");
  const addToCartButton = document.getElementById("addToCart");
  const resultDiv = document.getElementById("result");
  const clearCartButton = document.getElementById("clearCart");

  // Mettre à jour l'affichage du panier
  updateCartDisplay();

  // Gestionnaire pour le bouton de calcul
  calculateButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: () => {
            const iframe = document.querySelector(
              'iframe[data-testid="storybook-preview-iframe"]'
            );
            if (!iframe || !iframe.contentWindow) {
              return {
                success: false,
                message: "Iframe non trouvée ou non accessible",
              };
            }
            return {
              success: true,
              count: iframe.contentWindow.eval(`(${countShadow.toString()})()`),
            };
          },
        },
        (results) => {
          const result = results[0].result;
          if (result.success) {
            currentCount = result.count;
            resultDiv.textContent = `Nombre d'éléments : ${result.count}`;
            addToCartButton.disabled = false;
          } else {
            resultDiv.textContent = result.message;
            addToCartButton.disabled = true;
          }
        }
      );
    });
  });

  // Gestionnaire pour le bouton d'ajout au panier
  addToCartButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const componentName = tabs[0].url.split("/").pop().replace(".html", "");
      chrome.storage.local.get(["cart"], (result) => {
        const cart = result.cart || [];
        cart.push({ name: componentName, count: currentCount });
        chrome.storage.local.set({ cart }, () => {
          updateCartDisplay();
          addToCartButton.disabled = true;
          resultDiv.textContent = "Composant ajouté au panier !";
        });
      });
    });
  });

  // Gestionnaire pour le bouton de vidage du panier
  clearCartButton.addEventListener("click", () => {
    chrome.storage.local.set({ cart: [] }, updateCartDisplay);
  });

  // Gestionnaire pour les boutons de suppression d'items
  document.getElementById("cart-items").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
      const index = parseInt(e.target.dataset.index);
      chrome.storage.local.get(["cart"], (result) => {
        const cart = result.cart || [];
        cart.splice(index, 1);
        chrome.storage.local.set({ cart }, updateCartDisplay);
      });
    }
  });
});
