// principal-dashboard.js
// Principal module: payment table, teacher filter, accept menu and details popup.
// Standalone: does not use shared.js (it defines its own helpers).

// Add more records here; the table, totals and teacher filter update automatically.
  // status: "pending" | "accepted"
  const payments = [
    { id: "PAY-2026-009", student: "Aarav Mehta",   father: "Sanjay Mehta",   roll: "14", cls: "3-B", amount: 1500, payer: "Sanjay Mehta",   ref: "RCT-20261025-0009", phone: "+91 98765 41009", by: "Anil Verma",   at: "2026-10-25T09:20:00", acceptedAt: null, status: "pending" },
    { id: "PAY-2026-008", student: "Ananya Gupta",  father: "Rajesh Gupta",   roll: "07", cls: "5-A", amount: 2200, payer: "Neha Gupta",     ref: "RCT-20261024-0008", phone: "+91 98765 41008", by: "Meena Sharma", at: "2026-10-24T14:45:00", acceptedAt: null, status: "pending" },
    { id: "PAY-2026-007", student: "Rohan Kumar",   father: "Vinod Kumar",    roll: "22", cls: "2-C", amount: 1200, payer: "Vinod Kumar",    ref: "RCT-20261024-0007", phone: "+91 98765 41007", by: "Anil Verma",   at: "2026-10-24T10:05:00", acceptedAt: null, status: "pending" },
    { id: "PAY-2026-006", student: "Priya Singh",   father: "Mahesh Singh",   roll: "03", cls: "4-A", amount: 3500, payer: "Mahesh Singh",   ref: "RCT-20261023-0006", phone: "+91 98765 41006", by: "Rakesh Yadav", at: "2026-10-23T15:30:00", acceptedAt: null, status: "pending" },
    { id: "PAY-2026-005", student: "Kabir Singh",   father: "Harpal Singh",   roll: "11", cls: "1-A", amount: 5000, payer: "Harpal Singh",   ref: "RCT-20261023-0005", phone: "+91 98765 41005", by: "Sunita Rao",   at: "2026-10-23T11:15:00", acceptedAt: null, status: "pending" },
    { id: "PAY-2026-004", student: "Ishita Jain",   father: "Anil Jain",      roll: "18", cls: "6-B", amount: 2800, payer: "Anil Jain",      ref: "RCT-20261022-0004", phone: "+91 98765 41004", by: "Meena Sharma", at: "2026-10-22T12:10:00", acceptedAt: "2026-10-22T16:30:00", status: "accepted" },
    { id: "PAY-2026-003", student: "Vivaan Sharma", father: "Deepak Sharma",  roll: "09", cls: "1-B", amount: 1800, payer: "Pooja Sharma",   ref: "RCT-20261021-0003", phone: "+91 98765 41003", by: "Sunita Rao",   at: "2026-10-21T10:40:00", acceptedAt: "2026-10-21T14:10:00", status: "accepted" },
    { id: "PAY-2026-002", student: "Diya Patel",    father: "Kiran Patel",    roll: "05", cls: "3-A", amount: 2500, payer: "Kiran Patel",    ref: "RCT-20261020-0002", phone: "+91 98765 41002", by: "Rakesh Yadav", at: "2026-10-20T13:25:00", acceptedAt: "2026-10-20T16:05:00", status: "accepted" },
    { id: "PAY-2026-001", student: "Arjun Yadav",   father: "Ramesh Yadav",   roll: "16", cls: "2-A", amount: 1500, payer: "Ramesh Yadav",   ref: "RCT-20261019-0001", phone: "+91 98765 41001", by: "Sunita Rao",   at: "2026-10-19T09:50:00", acceptedAt: "2026-10-19T13:20:00", status: "accepted" }
  ];

  const fmtTime = iso => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const fmtDay = iso => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const statusLabel = { pending: "Pending", accepted: "Accepted" };
  const rupees = n => "₹" + n.toLocaleString("en-IN");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pencil = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';

  const select = document.getElementById("teacher");
  const menu = document.getElementById("menu");
  const toast = document.getElementById("toast");
  const teachers = [...new Set(payments.map(p => p.by))];
  select.innerHTML = '<option value="all">All teachers</option>' +
    teachers.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("");

  let currentList = [];
  let menuFor = null;   // payment id the menu is open for
  let menuTrigger = null;

  function render() {
    const f = select.value;
    const list = payments.filter(p => f === "all" || p.by === f);
    currentList = list;
    const total = list.reduce((s, p) => s + p.amount, 0);

    document.getElementById("numBox").textContent = list.length;
    document.getElementById("entries").textContent = list.length;
    document.getElementById("total").textContent = rupees(total);

    const body = document.getElementById("rows");
    if (!list.length) {
      body.innerHTML = '<tr><td class="empty" colspan="7">No payments recorded yet.</td></tr>';
      return;
    }
    body.innerHTML = list.map((p, i) => `
      <tr data-id="${esc(p.id)}" tabindex="0" aria-label="View payment details of ${esc(p.student)}">
        <td class="muted">${i + 1}</td>
        <td class="dt"><span class="time">${fmtTime(p.at)}</span><span class="day">${fmtDay(p.at)}</span></td>
        <td>${esc(p.cls)}</td>
        <td class="student">${esc(p.student)}</td>
        <td class="amt">${p.amount.toLocaleString("en-IN")}</td>
        <td>${esc(p.by)}</td>
        <td>
          <div class="status-cell">
            <span class="badge ${p.status}">${statusLabel[p.status]}</span>
            ${p.status === "pending"
              ? `<button class="edit-btn" type="button" data-id="${esc(p.id)}" aria-label="Edit status of ${esc(p.student)}" aria-haspopup="menu">${pencil}</button>`
              : ""}
          </div>
        </td>
      </tr>`).join("");
  }

  function closeMenu() {
    menu.hidden = true;
    menuFor = null;
    menuTrigger = null;
  }

  function openMenu(btn) {
    menuFor = btn.dataset.id;
    menuTrigger = btn;
    menu.hidden = false;
    const r = btn.getBoundingClientRect();
    const w = menu.offsetWidth;
    const left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
    menu.style.left = left + "px";
    menu.style.top = (r.bottom + 4) + "px";
    document.getElementById("acceptBtn").focus();
  }

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  document.getElementById("rows").addEventListener("click", e => {
    const btn = e.target.closest(".edit-btn");
    if (!btn) return;
    e.stopPropagation();
    if (menuFor === btn.dataset.id && !menu.hidden) closeMenu(); else openMenu(btn);
  });

  document.getElementById("acceptBtn").addEventListener("click", () => {
    const p = payments.find(x => x.id === menuFor);
    if (p) {
      p.status = "accepted";
      p.acceptedAt = new Date().toISOString();
      showToast(p.student + "'s payment marked as Accepted");
    }
    closeMenu();
    render();
  });

  document.addEventListener("click", e => { if (!menu.hidden && !menu.contains(e.target)) closeMenu(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !menu.hidden) { const t = menuTrigger; closeMenu(); if (t) t.focus(); }
  });
  window.addEventListener("resize", closeMenu);
  window.addEventListener("scroll", closeMenu, true);


  // ---- Payment details popup ----
  const modal = document.getElementById("modal");
  let modalTrigger = null;
  const fmtFull = iso => fmtDay(iso) + ", " + fmtTime(iso);

  function field(label, value, cls) {
    return `<div class="field"><label>${label}</label><div class="val ${cls || ""}">${value}</div></div>`;
  }

  function openModal(id, trigger) {
    const p = payments.find(x => x.id === id);
    if (!p) return;
    modalTrigger = trigger;
    const sn = currentList.indexOf(p) + 1;
    document.getElementById("mSn").textContent = sn || "";
    document.getElementById("mSub").textContent = p.id;

    const verified = p.acceptedAt
      ? field("Handover Accepted At", esc(fmtFull(p.acceptedAt)), "ok")
      : field("Handover Accepted At", "Not verified by principal", "warn");

    document.getElementById("mBody").innerHTML = `
      <div class="banner">Original entry amounts are non-editable after save.</div>
      <div class="section-h first">Payment</div>
      <div class="fields">
        ${field("Student Name", esc(p.student))}
        ${field("Father's Name", esc(p.father))}
        ${field("Class &amp; Section", "Class " + esc(p.cls))}
        ${field("Amount Collected (₹)", p.amount.toLocaleString("en-IN"))}
        ${field("Roll No.", esc(p.roll))}
        ${field("Payer Name", esc(p.payer))}
      </div>
      <div class="section-h">Receipt &amp; verification</div>
      <div class="fields">
        ${field("Payment Ref. No.", esc(p.ref))}
        ${field("Parent Phone (fee received SMS sent)", esc(p.phone))}
        ${field("Recorded By (Teacher)", esc(p.by))}
        ${field("Recorded On", esc(fmtFull(p.at)))}
        ${verified}
      </div>`;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("mClose").focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (modalTrigger && document.contains(modalTrigger)) modalTrigger.focus();
    modalTrigger = null;
  }

  document.getElementById("rows").addEventListener("click", e => {
    if (e.target.closest(".edit-btn")) return;
    const tr = e.target.closest("tr[data-id]");
    if (tr) openModal(tr.dataset.id, tr);
  });
  document.getElementById("rows").addEventListener("keydown", e => {
    const tr = e.target.closest("tr[data-id]");
    if (tr && e.target === tr && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openModal(tr.dataset.id, tr);
    }
  });
  document.getElementById("mX").addEventListener("click", closeModal);
  document.getElementById("mClose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  select.addEventListener("change", render);
  select.value = "all";
  render();
