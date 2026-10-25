// create-payment.js
// Teacher page: record a cash fee payment.
// Requires: payment-seed.js, shared.js

// Sample student master data (replace with real records)
const students = [
  {
    name: "Aarav Sharma",
    father: "Rajesh Sharma",
    roll: "101",
    cls: "Class 6 - A",
  },
  {
    name: "Ananya Verma",
    father: "Suresh Verma",
    roll: "102",
    cls: "Class 6 - A",
  },
  {
    name: "Ishaan Gupta",
    father: "Manoj Gupta",
    roll: "215",
    cls: "Class 8 - A",
  },
  {
    name: "Priya Singh",
    father: "Vikram Singh",
    roll: "310",
    cls: "Class 10 - A",
  },
];

const history = loadHistory();

// Auto-fill roll, father name and class when a student is picked (cleared when the pick is removed)
function applyStudent(s) {
  if (s) {
    $("rollNo").value = s.roll;
    $("fatherName").value = s.father;
    $("classSection").value = s.cls;
    clearError("studentName");
    clearError("rollNo");
  } else {
    $("rollNo").value = "";
    $("fatherName").value = "";
    $("classSection").value = "";
  }
}
const studentPicker = createStudentCombo(
  "studentName",
  "studentOptions",
  students,
  applyStudent,
);

// Validation helpers
function showError(id) {
  $(id).classList.add("invalid");
  $("err-" + id).classList.add("show");
}
function clearError(id) {
  $(id).classList.remove("invalid");
  $("err-" + id).classList.remove("show");
}

const required = [
  "studentName",
  "fatherName",
  "classSection",
  "amount",
  "rollNo",
  "payerName",
];

function validate() {
  let ok = true;
  required.forEach((id) => {
    const val = $(id).value.trim();
    let valid = val !== "";
    if (id === "amount") valid = Number(val) > 0;
    if (valid) clearError(id);
    else {
      showError(id);
      ok = false;
    }
  });
  return ok;
}

// Live clearing of errors while typing
required.forEach((id) => {
  $(id).addEventListener("input", () => {
    if ($(id).value.trim()) clearError(id);
  });
  $(id).addEventListener("change", () => {
    if ($(id).value.trim()) clearError(id);
  });
});

function resetForm() {
  $("payForm").reset();
  studentPicker.reset();
  $("rollNo").value = "";
  required.forEach(clearError);
}

// Submit
$("payForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;

  const amount = Number($("amount").value);
  const now = new Date();
  const entry = {
    timeStr: now.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }),
    dateStr: now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    student: $("studentName").value.trim(),
    father: $("fatherName").value.trim(),
    cls: $("classSection").value,
    roll: $("rollNo").value,
    payer: $("payerName").value.trim(),
    amount: amount,
    ref:
      "RCT-" +
      now.toISOString().slice(0, 10).replace(/-/g, "") +
      "-" +
      String(history.length + 1).padStart(4, "0"),
    recordedBy: "Anil Verma",
    recordedOn: now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    status: "Pending",
    acceptedAt: null,
  };
  history.push(entry);
  saveHistory(history);
  resetForm();
  toast(
    "Payment recorded successfully. Receipt #" +
      String(history.length).padStart(4, "0") +
      " generated.",
  );
});

$("clearBtn").addEventListener("click", resetForm);

$("logoutBtn").addEventListener("click", () =>
  toast("Logged out (prototype). Session cleared."),
);
$("helpBtn").addEventListener("click", () =>
  toast("For support, contact the school accounts office."),
);
