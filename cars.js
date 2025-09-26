// Get parts of the page
const productsContainer = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");

const productDetailView = document.getElementById("product-detail-view");
const detailImage = document.getElementById("detail-image");
const detailName = document.getElementById("detail-name");
const detailDescription = document.getElementById("detail-description");
const detailPrice = document.getElementById("detail-price");
const detailCategory = document.getElementById("detail-category");
const addToCartBtn = document.getElementById("add-to-cart-btn");

const cartContainer = document.getElementById("cart-container");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");

let allProducts = [];
let currentProduct = null;
let cart = [];

// Load products from server
function loadProducts() {
  productsContainer.innerHTML = "<p>Loading products...</p>";

  fetch("http://localhost:3000/products")
    .then((res) => res.json())
    .then((data) => {
      allProducts = data.flatMap((product) =>
        product.variants.map((variant) => ({
          ...variant,
          category: product.category,
        }))
      );
      displayProducts(allProducts);
    })
    .catch(() => {
      productsContainer.innerHTML = "<p>Could not load products.</p>";
    });
}

// Show products on page
function displayProducts(products) {
  if (products.length === 0) {
    productsContainer.innerHTML = "<p>No products found.</p>";
    return;
  }

  productsContainer.innerHTML = products
    .map(
      (product) => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p><strong>KES ${product.price}</strong></p>
        <p class="category">${product.category}</p>
        <button class="add-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute("data-id"));
      const product = allProducts.find((p) => p.id === id);
      if (product) addToCart(product);
    });
  });
}

// Show one product's details
function showProductDetail(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  currentProduct = product;

  detailImage.src = product.image;
  detailImage.alt = product.name;
  detailName.textContent = product.name;
  detailDescription.textContent = product.description;
  detailPrice.textContent = product.price;
  detailCategory.textContent = product.category;

  productsContainer.classList.add("hidden");
  productDetailView.classList.remove("hidden");

  productDetailView.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Back to product list
function goHome() {
  productDetailView.classList.add("hidden");
  productsContainer.classList.remove("hidden");
  currentProduct = null;
}

// Add item to cart
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
}

// Add to cart from details page
addToCartBtn.addEventListener("click", () => {
  if (!currentProduct) return;
  addToCart(currentProduct);
  goHome();
});

// Update cart display
function updateCartUI() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartCount.textContent = "0";
    cartTotalEl.textContent = "0";
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item" data-id="${item.id}">
        <span>${item.name} x ${item.quantity}</span>
        <span>KES ${item.price * item.quantity}</span>
        <button class="delete-btn" data-id="${item.id}">Delete</button>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      removeFromCart(id);
    });
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartTotalEl.textContent = total;
  cartCount.textContent = totalItems;
}

// Remove item from cart
function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    updateCartUI();
  }
}

// Show cart section
function scrollToCart() {
  if (cartContainer.classList.contains("hidden")) {
    cartContainer.classList.remove("hidden");
  }
  cartContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Search for products
function searchProducts() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(term)
  );
  displayProducts(filtered);
}

// Run search on Enter key
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchProducts();
  }
});

// When page loads
window.onload = () => {
  loadProducts();
  updateCartUI();
};
