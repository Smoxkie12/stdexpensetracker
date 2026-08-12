/*
 * StudentExpenseTracker — plain JavaScript (no React, no build tools).
 *
 * Data lives in localStorage for now. To connect a Python/FastAPI backend,
 * replace the three functions in the "DATA LAYER" section with fetch() calls.
 */

/* ============ DATA LAYER (swap these for FastAPI later) ============ */

var STORAGE_KEY = "student-expense-tracker-expenses";

var CATEGORIES = [
  "Food",
  "Transport",
  "Education",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Health",
  "Other",
];

function getExpenses() {
  // FastAPI version: return fetch("/api/expenses").then(function (r) { return r.json(); });
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveExpense(expense) {
  // FastAPI version:
  // return fetch("/api/expenses", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(expense),
  // });
  var all = getExpenses();
  all.push(expense);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function deleteExpense(id) {
  // FastAPI version: return fetch("/api/expenses/" + id, { method: "DELETE" });
  var all = getExpenses().filter(function (e) {
    return e.id !== id;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/* ============ HELPERS ============ */

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function makeId() {
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

function $(selector) {
  return document.querySelector(selector);
}

/* ============ ROUTER (hash based) ============ */

var PAGES = ["home", "add", "dashboard"];

function currentPage() {
  var hash = window.location.hash.replace("#", "");
  return PAGES.indexOf(hash) !== -1 ? hash : "home";
}

function showPage(page) {
  PAGES.forEach(function (p) {
    $("#page-" + p).hidden = p !== page;
  });

  document.querySelectorAll("[data-nav]").forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("data-nav") === page);
  });

  if (page === "dashboard") renderDashboard();
  window.scrollTo(0, 0);
}

/* ============ ADD EXPENSE FORM ============ */

function fillCategories() {
  var select = $("#category");
  CATEGORIES.forEach(function (c) {
    var option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    select.appendChild(option);
  });
}

function showAlert(text, isError) {
  var alert = $("#form-alert");
  alert.textContent = text;
  alert.className = "alert " + (isError ? "alert-error" : "alert-success");
  alert.hidden = false;
}

function handleSubmit(event) {
  event.preventDefault();

  var name = $("#name").value.trim();
  var amount = $("#amount").value.trim();
  var category = $("#category").value;
  var date = $("#date").value;

  if (!name || !amount || !category || !date) {
    showAlert("Please fill in all fields.", true);
    return;
  }

  var parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    showAlert("Please enter a valid amount greater than 0.", true);
    return;
  }

  saveExpense({
    id: makeId(),
    name: name,
    amount: parsed,
    category: category,
    date: date,
  });

  $("#expense-form").reset();
  showAlert("Expense saved successfully!", false);

  setTimeout(function () {
    window.location.hash = "dashboard";
  }, 800);
}

/* ============ DASHBOARD ============ */

function renderDashboard() {
  var expenses = getExpenses();

  var total = expenses.reduce(function (sum, e) {
    return sum + e.amount;
  }, 0);

  var categoryTotals = {};
  expenses.forEach(function (e) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  var sortedCategories = Object.keys(categoryTotals)
    .map(function (cat) {
      return [cat, categoryTotals[cat]];
    })
    .sort(function (a, b) {
      return b[1] - a[1];
    });

  $("#stat-total").textContent = formatCurrency(total);
  $("#stat-categories").textContent = sortedCategories.length;
  $("#stat-count").textContent = expenses.length;

  // Category tags
  var tags = $("#category-tags");
  tags.innerHTML = "";
  sortedCategories.forEach(function (entry) {
    var span = document.createElement("span");
    span.className = "tag";
    span.appendChild(document.createTextNode(entry[0] + ": "));
    var strong = document.createElement("strong");
    strong.textContent = formatCurrency(entry[1]);
    span.appendChild(strong);
    tags.appendChild(span);
  });
  $("#category-section").hidden = sortedCategories.length === 0;

  // History table
  $("#empty-state").hidden = expenses.length !== 0;
  $("#table-wrap").hidden = expenses.length === 0;

  var tbody = $("#expense-rows");
  tbody.innerHTML = "";

  expenses
    .slice()
    .sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .forEach(function (expense) {
      var tr = document.createElement("tr");

      var nameCell = document.createElement("td");
      var strong = document.createElement("strong");
      strong.textContent = expense.name;
      nameCell.appendChild(strong);

      var categoryCell = document.createElement("td");
      categoryCell.textContent = expense.category;

      var dateCell = document.createElement("td");
      dateCell.className = "muted";
      dateCell.textContent = formatDate(expense.date);

      var amountCell = document.createElement("td");
      amountCell.className = "text-right";
      var amountStrong = document.createElement("strong");
      amountStrong.textContent = formatCurrency(expense.amount);
      amountCell.appendChild(amountStrong);

      var actionCell = document.createElement("td");
      actionCell.className = "text-center";
      var button = document.createElement("button");
      button.className = "btn-icon";
      button.type = "button";
      button.setAttribute("aria-label", "Delete " + expense.name);
      button.textContent = "🗑️";
      button.addEventListener("click", function () {
        deleteExpense(expense.id);
        renderDashboard();
      });
      actionCell.appendChild(button);

      tr.appendChild(nameCell);
      tr.appendChild(categoryCell);
      tr.appendChild(dateCell);
      tr.appendChild(amountCell);
      tr.appendChild(actionCell);
      tbody.appendChild(tr);
    });
}

/* ============ START ============ */

fillCategories();
$("#expense-form").addEventListener("submit", handleSubmit);
window.addEventListener("hashchange", function () {
  showPage(currentPage());
});
showPage(currentPage());
