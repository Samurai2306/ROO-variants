(function () {
  "use strict";

  var menuButton = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".site-nav");
  var media = window.matchMedia("(max-width: 768px)");
  var lastFocus = null;
  var search = document.querySelector("[data-search]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var empty = document.querySelector("[data-empty]");
  var currentFilter = "all";

  function setMenu(open, restore) {
    if (!media.matches) {
      menu.classList.add("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      return;
    }
    menu.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open && restore) menuButton.focus();
  }

  function syncMenu() {
    if (media.matches) setMenu(false, false);
    else menu.classList.remove("is-open");
  }

  menuButton.addEventListener("click", function () {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true", false);
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false, false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var openDialog = document.querySelector("dialog[open]");
    if (openDialog) {
      event.preventDefault();
      openDialog.close();
      return;
    }
    if (menuButton.getAttribute("aria-expanded") === "true") setMenu(false, true);
  });

  if (typeof media.addEventListener === "function") media.addEventListener("change", syncMenu);
  else media.addListener(syncMenu);

  function openDialog(dialog, button) {
    var title = button.getAttribute("data-title");
    var note = button.getAttribute("data-note");
    var titleSlot = dialog.querySelector("[data-dialog-title]");
    var noteSlot = dialog.querySelector("[data-dialog-note]");
    if (title && titleSlot) titleSlot.textContent = title;
    if (note && noteSlot) noteSlot.textContent = note;
    var downloadStatus = dialog.querySelector("[data-download-status]");
    if (downloadStatus) downloadStatus.textContent = "";
    lastFocus = button;
    dialog.showModal();
    var closeButton = dialog.querySelector("[data-close]");
    if (closeButton) closeButton.focus();
  }

  document.addEventListener("click", function (event) {
    var opener = event.target.closest("[data-open]");
    if (opener) {
      var dialog = document.getElementById(opener.getAttribute("data-open"));
      if (dialog) openDialog(dialog, opener);
      return;
    }
    var closer = event.target.closest("[data-close]");
    if (closer) {
      var parent = closer.closest("dialog");
      if (parent && parent.open) parent.close();
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll("dialog"), function (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
        lastFocus = null;
      }
    });
  });

  document.addEventListener("click", function (event) {
    var download = event.target.closest("[data-download-note]");
    if (!download) return;
    var status = download.parentElement.querySelector("[data-download-status]");
    if (status) status.textContent = "Файл для скачивания добавит Заказчик.";
  });

  function applyCatalog() {
    var query = search.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var category = (card.getAttribute("data-category") || "").toLowerCase();
      var filterOk = currentFilter === "all" || category === currentFilter.toLowerCase();
      var queryOk = query === "" || title.indexOf(query) !== -1 || category.indexOf(query) !== -1;
      var show = filterOk && queryOk;
      card.hidden = !show;
      if (show) visible += 1;
    });
    empty.textContent = visible === 0 ? "Ничего не найдено. Измените запрос или категорию." : "";
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (button) {
    button.addEventListener("click", function () {
      currentFilter = button.getAttribute("data-filter");
      Array.prototype.forEach.call(document.querySelectorAll("[data-filter]"), function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      applyCatalog();
    });
  });

  search.addEventListener("input", applyCatalog);

  Array.prototype.forEach.call(document.querySelectorAll("[data-set-category]"), function (button) {
    button.addEventListener("click", function () {
      var select = document.getElementById("reception-category");
      select.value = button.getAttribute("data-set-category");
      document.getElementById("reception").scrollIntoView();
      select.focus();
    });
  });

  function fieldInvalid(field) {
    if (!field.hasAttribute("required")) return false;
    var value = field.value.trim();
    if (value === "") return true;
    if (field.type === "email") return field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return false;
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-demo-form]"), function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var invalid = [];
      Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (field) {
        var error = document.getElementById(field.id + "-error");
        if (fieldInvalid(field)) {
          field.setAttribute("aria-invalid", "true");
          if (error) error.hidden = false;
          invalid.push(field);
        } else {
          field.removeAttribute("aria-invalid");
          if (error) error.hidden = true;
        }
      });
      var status = form.querySelector("[data-form-status]");
      if (invalid.length) {
        status.textContent = "";
        invalid[0].focus();
        return;
      }
      form.reset();
      status.textContent = "Демонстрационный режим: данные не отправлены";
    });
  });
})();
