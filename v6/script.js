(function () {
  var menuButton = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".site-nav");
  var media = window.matchMedia("(max-width: 48rem)");
  var lastFocus = null;

  function setMenu(open, restore) {
    if (!menu || !menuButton) return;
    if (!media.matches) {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      return;
    }
    menu.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open && restore) menuButton.focus();
  }

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true", false);
    });
  }
  if (menu) {
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a") && media.matches) setMenu(false, false);
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var openDialog = document.querySelector("dialog[open]");
    if (openDialog) {
      event.preventDefault();
      openDialog.close();
      return;
    }
    if (menuButton && menuButton.getAttribute("aria-expanded") === "true") setMenu(false, true);
  });
  if (media.addEventListener) media.addEventListener("change", function () { setMenu(false, false); });

  function openDialog(dialog, button) {
    lastFocus = button;
    var title = button.getAttribute("data-title");
    var slot = dialog.querySelector("[data-dialog-title]");
    if (title && slot) slot.textContent = title;
    var note = button.getAttribute("data-note");
    var noteSlot = dialog.querySelector("[data-dialog-note]");
    if (note && noteSlot) noteSlot.textContent = note;
    dialog.showModal();
    var closeButton = dialog.querySelector("[data-close]");
    if (closeButton) closeButton.focus();
  }

  document.addEventListener("click", function (event) {
    var preset = event.target.closest("[data-set-category]");
    if (preset) {
      var select = document.getElementById("reception-category");
      if (select) select.value = preset.getAttribute("data-set-category");
    }
    var opener = event.target.closest("[data-open]");
    if (opener) {
      event.preventDefault();
      var dialog = document.getElementById(opener.getAttribute("data-open"));
      if (dialog) openDialog(dialog, opener);
    }
    var closer = event.target.closest("[data-close]");
    if (closer) {
      var parent = closer.closest("dialog");
      if (parent && parent.open) parent.close();
    }
    var download = event.target.closest("[data-download-note]");
    if (download) {
      var status = download.parentElement.querySelector("[data-download-status]");
      if (status) status.textContent = "Файл для скачивания добавит Заказчик.";
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

  var params = new URLSearchParams(window.location.search);
  var cat = params.get("cat");
  var presetSelect = document.getElementById("reception-category");
  if (cat && presetSelect) presetSelect.value = cat;

  var currentFilter = "all";
  var currentTag = "all";
  var search = document.querySelector("[data-search]");

  function applyCatalog() {
    var query = search ? search.value.trim().toLowerCase() : "";
    var visible = 0;
    Array.prototype.forEach.call(document.querySelectorAll("[data-card]"), function (card) {
      var okCat = currentFilter === "all" || card.getAttribute("data-category") === currentFilter;
      var tags = (card.getAttribute("data-tags") || "").split(",");
      var okTag = currentTag === "all" || tags.indexOf(currentTag) !== -1;
      var okText = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
      var ok = okCat && okTag && okText;
      card.hidden = !ok;
      if (ok) visible += 1;
    });
    var empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = visible !== 0;
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
  Array.prototype.forEach.call(document.querySelectorAll("[data-tag]"), function (button) {
    button.addEventListener("click", function () {
      currentTag = button.getAttribute("data-tag");
      Array.prototype.forEach.call(document.querySelectorAll("[data-tag]"), function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      applyCatalog();
    });
  });
  if (search) search.addEventListener("input", applyCatalog);

  function fieldInvalid(field) {
    if (!field.hasAttribute("required")) return false;
    if (field.type === "checkbox") return !field.checked;
    var value = field.value.trim();
    if (value === "") return true;
    if (field.type === "email") return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return false;
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-demo-form]"), function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var invalid = [];
      Array.prototype.forEach.call(form.querySelectorAll("input, select, textarea"), function (field) {
        if (field.type === "file") return;
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
        if (status) status.textContent = "";
        invalid[0].focus();
        return;
      }
      form.reset();
      if (status) status.textContent = "Демонстрационный режим: данные не отправлены";
    });
  });
})();
