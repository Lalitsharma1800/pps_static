// student-combo.js
// Searchable student picker (like a search bar with suggestions).
// The user types to filter the list and must pick an item.
// Free text is not kept: if the user leaves the field without picking, the text is cleared.
// Usage: createStudentCombo(inputId, listId, items, onSelect)
//   onSelect(item) is called on pick, and onSelect(null) when the pick is cleared.

function createStudentCombo(inputId, listId, items, onSelect) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  let selected = null; // the picked item object
  let shown = []; // items currently in the list
  let activeIndex = -1; // keyboard highlight

  // Essential styles are set inline so the dropdown works even if the stylesheet is missing or old
  input.parentElement.style.position = "relative";
  Object.assign(list.style, {
    position: "absolute",
    left: "0",
    right: "0",
    zIndex: "20",
    background: "#fff",
    border: "1px solid #c9d2de",
    borderRadius: "4px",
    boxShadow: "0 6px 16px rgba(20, 27, 45, .12)",
    overflowY: "auto",
    textAlign: "left",
    boxSizing: "border-box",
  });

  function render(query) {
    const q = query.trim().toLowerCase();
    shown = items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.father.toLowerCase().includes(q),
    );
    activeIndex = -1;
    list.innerHTML = "";

    if (shown.length === 0) {
      const empty = document.createElement("div");
      empty.className = "combo-empty";
      empty.textContent = "No student found";
      Object.assign(empty.style, {
        padding: "10px 12px",
        color: "#6b7280",
        fontSize: "14px",
      });
      list.appendChild(empty);
      return;
    }

    shown.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "combo-item";
      row.setAttribute("role", "option");
      const nameLine = document.createElement("div");
      nameLine.textContent = s.name;
      const fatherLine = document.createElement("div");
      fatherLine.textContent = "Father: " + s.father;
      Object.assign(fatherLine.style, {
        fontSize: "13px",
        color: "#6b7280",
        marginTop: "2px",
      });
      row.appendChild(nameLine);
      row.appendChild(fatherLine);
      Object.assign(row.style, {
        padding: "10px 12px",
        cursor: "pointer",
        fontSize: "15px",
        color: "#1f2937",
      });
      // pointerdown works for both mouse and touch, and runs before the input's blur,
      // so the pick is not lost on phones
      row.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        choose(i);
      });
      list.appendChild(row);
    });
  }

  // Open the list below the field, or above it when there is more room there.
  // Also limits the height so the list never goes past the screen edge.
  function placeList() {
    const combo = input.parentElement;
    const r = input.getBoundingClientRect();
    const gap = 8;
    const LIMIT = 240;
    // On phones the keyboard shrinks the visible area, so use visualViewport when available
    const vh = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;
    const below = vh - r.bottom - gap;
    const above = r.top - gap;
    const up = below < 160 && above > below;
    combo.classList.toggle("drop-up", up);
    if (up) {
      Object.assign(list.style, {
        top: "auto",
        bottom: "100%",
        marginTop: "0",
        marginBottom: "4px",
      });
    } else {
      Object.assign(list.style, {
        top: "100%",
        bottom: "auto",
        marginTop: "4px",
        marginBottom: "0",
      });
    }
    list.style.maxHeight =
      Math.max(80, Math.min(LIMIT, up ? above : below)) + "px";
  }

  function openList() {
    placeList();
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function closeList() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  }

  function choose(i) {
    const s = shown[i];
    if (!s) return;
    selected = s;
    input.value = s.name;
    closeList();
    onSelect(s);
  }

  function highlight() {
    const rows = list.querySelectorAll(".combo-item");
    rows.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    if (rows[activeIndex])
      rows[activeIndex].scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("focus", () => {
    // Show the full list when the field is empty or still holds the picked name
    const showAll = !selected || input.value === selected.name;
    render(showAll ? "" : input.value);
    openList();
  });

  input.addEventListener("input", () => {
    if (selected && input.value !== selected.name) {
      selected = null;
      onSelect(null);
    }
    render(input.value);
    openList();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (list.hidden) openList();
      if (shown.length)
        activeIndex = Math.min(activeIndex + 1, shown.length - 1);
      highlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (shown.length) activeIndex = Math.max(activeIndex - 1, 0);
      highlight();
    } else if (e.key === "Enter") {
      if (!list.hidden) {
        e.preventDefault();
        const pick =
          activeIndex >= 0 ? activeIndex : shown.length === 1 ? 0 : -1;
        if (pick >= 0) choose(pick);
      }
    } else if (e.key === "Escape") {
      closeList();
    }
  });

  input.addEventListener("blur", () => {
    closeList();
    // Only a picked student may stay in the field
    if (!selected || input.value !== selected.name) {
      input.value = "";
      if (selected) {
        selected = null;
        onSelect(null);
      }
    }
  });

  // Keep the list in the right place if the screen or keyboard changes size while open
  window.addEventListener("resize", () => {
    if (!list.hidden) placeList();
  });
  window.addEventListener(
    "scroll",
    () => {
      if (!list.hidden) placeList();
    },
    true,
  );

  return {
    reset() {
      selected = null;
      input.value = "";
      closeList();
    },
    getSelected() {
      return selected;
    },
  };
}
