// history-handover.js
// Teacher page: view recorded payments and a read-only detail popup.
// Requires: payment-seed.js, shared.js

const history = loadHistory();

// Splits "First Last Name" into first word and rest on separate lines
function splitName(name) {
  const parts = String(name).trim().split(/\s+/);
  const first =
    '<span class="name-first">' + escapeHtml(parts[0] || "") + "</span>";
  if (parts.length < 2) return first;
  return (
    first +
    '<span class="name-last">' +
    escapeHtml(parts.slice(1).join(" ")) +
    "</span>"
  );
}

// Full name on one line (centred) if it fits the column; otherwise first/last on two lines
function fitNames() {
  document.querySelectorAll(".name-cell").forEach((cell) => {
    const full = cell.dataset.name || "";
    cell.innerHTML = '<span class="name-text">' + escapeHtml(full) + "</span>";
    const t = cell.firstElementChild;
    if (t.scrollWidth > t.clientWidth) cell.innerHTML = splitName(full);
  });
}
window.addEventListener("resize", fitNames);

// "Class 3 - A" -> "3-A" to keep the table column narrow
function shortCls(c) {
  return String(c).replace("Class ", "").replace(" - ", "-");
}

// History rendering
function renderHistory() {
  const body = $("historyBody");
  body.innerHTML = "";
  history.forEach((h, i) => {
    const tr = document.createElement("tr");
    const badgeCls = h.status === "Accepted" ? "badge" : "badge pending";
    tr.className = "row-click";
    tr.tabIndex = 0;
    tr.innerHTML = `
        <td class="col-sn">${i + 1}</td>
        <td class="col-dt"><span class="nowrap">${h.timeStr}</span><span class="sub">${h.dateStr}</span></td>
        <td class="col-cls">${shortCls(h.cls)}</td>
        <td class="col-stu name-cell" data-name="${escapeHtml(h.student)}"></td>
        <td class="col-opt col-roll">${escapeHtml(h.roll)}</td>
        <td class="col-opt col-payer name-cell" data-name="${escapeHtml(h.payer)}"></td>
        <td class="num col-amt">${h.amount.toLocaleString("en-IN")}</td>
        <td class="col-status"><span class="${badgeCls}">${h.status}</span></td>`;
    tr.addEventListener("click", () => openDetail(i));
    tr.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDetail(i);
      }
    });
    body.appendChild(tr);
  });
  const total = history.reduce((s, h) => s + h.amount, 0);
  $("totalCollected").textContent = "₹" + total.toLocaleString("en-IN");
  $("entryCount").textContent = history.length;
  $("emptyMsg").classList.toggle("hidden", history.length > 0);
  fitNames();
}

// Read-only payment detail popup (teacher cannot edit anything here)
function openDetail(i) {
  const h = history[i];
  if (!h) return;
  const v = (x) => escapeHtml(String(x || "—"));
  const field = (label, value, extra = "") =>
    `<div class="det-field"><label>${label}</label><div class="det-val ${extra}">${value}</div></div>`;
  const handover =
    h.status === "Accepted"
      ? field("Handover Accepted At", v(h.acceptedAt), "ok")
      : field("Handover Accepted At", "Not verified by principal", "pending");

  $("detailIndex").textContent = i + 1;
  $("detailRef").textContent = h.ref;
  $("detailBody").innerHTML = `
      <div class="det-notice">Read-only view. Entries cannot be edited or deleted after save.</div>
      <div class="det-section">Payment</div>
      <div class="det-grid">
        ${field("Student Name", v(h.student))}
        ${field("Father's Name", v(h.father))}
        ${field("Class &amp; Section", v(h.cls))}
        ${field("Amount Collected (₹)", h.amount.toLocaleString("en-IN"))}
        ${field("Roll No.", v(h.roll))}
        ${field("Payer Name", v(h.payer))}
      </div>
      <div class="det-section">Receipt &amp; Verification</div>
      <div class="det-grid">
        ${field("Payment Ref. No.", v(h.ref))}
        ${field("Recorded By (Teacher)", v(h.recordedBy))}
        ${field("Recorded On", v(h.recordedOn))}
        ${handover}
      </div>`;
  $("detailModal").classList.remove("hidden");
  $("detailClose").focus();
}

function closeDetail() {
  $("detailModal").classList.add("hidden");
}
$("detailClose").addEventListener("click", closeDetail);
$("detailCloseBtn").addEventListener("click", closeDetail);
$("detailModal").addEventListener("click", (e) => {
  if (e.target.id === "detailModal") closeDetail();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDetail();
});

$("logoutBtn").addEventListener("click", () =>
  toast("Logged out (prototype). Session cleared."),
);
$("helpBtn").addEventListener("click", () =>
  toast("For support, contact the school accounts office."),
);

renderHistory();
