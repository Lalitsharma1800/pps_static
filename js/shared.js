// shared.js
// Helpers used by both teacher pages (create-payment, history-handover).
// Load order: payment-seed.js -> shared.js -> page script.

const $ = id => document.getElementById(id);
// Shared session storage so both pages see the same payments
const STORE_KEY = "chf_payment_history";

// Returns the saved payments, or a copy of SEED on first load
function loadHistory() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SEED.slice();
}


// Saves the given payment list to sessionStorage
function saveHistory(list) {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
}

// Escapes & < > " ' so user text is safe inside innerHTML
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}


// Shows the #toast element for 4 seconds
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 4000);
}

