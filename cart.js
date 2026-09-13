// Saad Fabrics Cart + Bulk Offer System
const CART_KEY = 'saadfabrics_cart';
const BASE_PRICE = 2300;

function getTierDiscount(qty) {
  if (qty >= 4) return 0.20;
  if (qty >= 3) return 0.15;
  if (qty >= 2) return 0.10;
  return 0;
}

function getTierLabel(qty) {
  if (qty >= 4) return '20% OFF (Buy 4+)';
  if (qty >= 3) return '15% OFF (Buy 3)';
  if (qty >= 2) return '10% OFF (Buy 2)';
  return '';
}

function getUnitPrice(qty) {
  const d = getTierDiscount(qty);
  return Math.round(BASE_PRICE * (1 - d));
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  if (typeof updateOfferBanner === 'function') updateOfferBanner();
}

function addToCart(product) {
  const cart = getCart();
  const price = product.price != null ? product.price : BASE_PRICE;
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      image: product.image,
      price: price,
      qty: 1
    });
  }
  saveCart(cart);
  showToast(product.name + ' cart mein add ho gaya!');
}

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  if (typeof renderCart === 'function') renderCart();
}

function updateQty(id, change) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty < 1) {
    removeFromCart(id);
    return;
  }
  saveCart(cart);
  if (typeof renderCart === 'function') renderCart();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartSubtotal() {
  return getCart().reduce((sum, item) => sum + (BASE_PRICE * item.qty), 0);
}

function getCartTotal() {
  const qty = getCartCount();
  return getUnitPrice(qty) * qty;
}

function getCartDiscountAmount() {
  return getCartSubtotal() - getCartTotal();
}
function getCartListSubtotal() {
  return getCartSubtotal();
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function showToast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function buildWhatsAppMessage(customer) {
  const cart = getCart();
  if (cart.length === 0) return '';
  const qty = getCartCount();
  const unit = getUnitPrice(qty);
  const subtotal = getCartSubtotal();
  const total = getCartTotal();
  const discount = getCartDiscountAmount();
  const tier = getTierLabel(qty);
  let msg = '*New Order - Saad Fabrics*%0A%0A';
  msg += '*Customer Details:*%0A';
  msg += 'Name: ' + customer.name + '%0A';
  msg += 'Phone: ' + customer.phone + '%0A';
  msg += 'City: ' + customer.city + '%0A';
  msg += 'Address: ' + customer.address + '%0A';
  if (customer.notes) msg += 'Notes: ' + customer.notes + '%0A';
  msg += '%0A*Order Items:*%0A';
  cart.forEach((item, i) => {
    msg += (i + 1) + '. ' + item.name + ' x ' + item.qty + '%0A';
  });
  msg += '%0A*Subtotal: Rs ' + subtotal.toLocaleString() + '*%0A';
  if (discount > 0) {
    msg += '*Bulk Offer: ' + tier + ' (-Rs ' + discount.toLocaleString() + ')*%0A';
  }
  msg += '*Total: Rs ' + total.toLocaleString() + '*%0A';
  msg += 'Unit Price: Rs ' + unit.toLocaleString() + ' each%0A';
  msg += 'Free Delivery (2-3 Business Days)%0A%0A';
  msg += 'Please confirm my order. Thank you!';
  return msg;
}

document.addEventListener('DOMContentLoaded', updateCartCount);
