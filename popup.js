document.addEventListener("DOMContentLoaded", () => {
  function updateCart() {
    chrome.storage.local.get(["cart"], (result) => {
      const cart = result.cart || [];
      const cartItems = document.getElementById("cart-items");
      const totalCount = document.getElementById("total-count");

      cartItems.innerHTML = "";
      let total = 0;

      cart.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "component-item";
        div.innerHTML = `
          <span>${item.name}</span>
          <span>${item.count} éléments</span>
          <button data-index="${index}">Supprimer</button>
        `;
        cartItems.appendChild(div);
        total += item.count;
      });

      totalCount.textContent = total;
    });
  }

  document.getElementById("clear-cart").addEventListener("click", () => {
    chrome.storage.local.set({ cart: [] }, updateCart);
  });

  document.getElementById("cart-items").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const index = parseInt(e.target.dataset.index);
      chrome.storage.local.get(["cart"], (result) => {
        const cart = result.cart || [];
        cart.splice(index, 1);
        chrome.storage.local.set({ cart }, updateCart);
      });
    }
  });

  updateCart();
});
