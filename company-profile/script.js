/**
 * Elisence Company Profile — Static Web Viewer
 * Pages 01–16 · hash navigation · keyboard · preload
 */

(function () {
  "use strict";

  const TOTAL_PAGES = 16;

  const els = {
    artwork: document.getElementById("page-artwork"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    pageKeys: document.getElementById("page-keys"),
  };

  const preloadCache = new Map();
  let currentPage = 1;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function pageSrc(num) {
    return "pages/page-" + pad(num) + ".jpg";
  }

  function pageHash(num) {
    return "#page-" + pad(num);
  }

  function parseHash() {
    const match = location.hash.match(/^#page-(\d{2})$/);
    if (!match) return null;
    const num = parseInt(match[1], 10);
    if (num < 1 || num > TOTAL_PAGES) return null;
    return num;
  }

  function preloadPage(num) {
    if (num < 1 || num > TOTAL_PAGES) return;
    const src = pageSrc(num);
    if (preloadCache.has(src)) return;

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    preloadCache.set(src, img);
  }

  function preloadAdjacent(num) {
    preloadPage(num - 1);
    preloadPage(num + 1);
  }

  function buildPageKeys() {
    els.pageKeys.innerHTML = "";

    for (let i = 1; i <= TOTAL_PAGES; i += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-key";
      btn.dataset.page = String(i);
      btn.textContent = pad(i);
      btn.setAttribute("aria-label", "Go to page " + pad(i));
      btn.setAttribute("aria-current", "false");
      btn.addEventListener("click", () => goToPage(i));
      els.pageKeys.appendChild(btn);
    }
  }

  function updatePageKeys() {
    const buttons = els.pageKeys.querySelectorAll(".page-key");
    buttons.forEach((btn) => {
      const num = parseInt(btn.dataset.page, 10);
      const active = num === currentPage;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-current", active ? "page" : "false");
    });
  }

  function updateNavButtons() {
    els.btnPrev.disabled = currentPage <= 1;
    els.btnNext.disabled = currentPage >= TOTAL_PAGES;
  }

  function setHash(num) {
    const nextHash = pageHash(num);
    if (location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }
  }

  function showPage(num) {
    const src = pageSrc(num);
    els.artwork.classList.remove("is-ready");
    els.artwork.classList.add("is-loading");
    els.artwork.alt = "Elisence Company Profile — Page " + pad(num);

    const cached = preloadCache.get(src);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      els.artwork.src = src;
      els.artwork.classList.remove("is-loading");
      els.artwork.classList.add("is-ready");
      return;
    }

    els.artwork.onload = () => {
      els.artwork.onload = null;
      els.artwork.classList.remove("is-loading");
      els.artwork.classList.add("is-ready");
    };

    els.artwork.onerror = () => {
      els.artwork.onload = null;
      els.artwork.onerror = null;
      els.artwork.classList.remove("is-loading");
      els.artwork.alt = "Page " + pad(num) + " artwork unavailable";
    };

    els.artwork.src = src;
  }

  function goToPage(num, updateHashFlag) {
    if (num < 1 || num > TOTAL_PAGES) return;
    if (num === currentPage && updateHashFlag !== true) return;

    currentPage = num;
    showPage(num);
    preloadAdjacent(num);
    updatePageKeys();
    updateNavButtons();

    if (updateHashFlag !== false) {
      setHash(num);
    }
  }

  function initFromHash() {
    const fromHash = parseHash();
    goToPage(fromHash || 1, false);
    if (fromHash) {
      setHash(fromHash);
    } else if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  els.btnPrev.addEventListener("click", () => goToPage(currentPage - 1));
  els.btnNext.addEventListener("click", () => goToPage(currentPage + 1));

  window.addEventListener("hashchange", () => {
    const fromHash = parseHash();
    if (fromHash && fromHash !== currentPage) {
      goToPage(fromHash, false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        goToPage(currentPage - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        goToPage(currentPage + 1);
        break;
      case "Home":
        e.preventDefault();
        goToPage(1);
        break;
      case "End":
        e.preventDefault();
        goToPage(TOTAL_PAGES);
        break;
      default:
        break;
    }
  });

  buildPageKeys();
  initFromHash();
  preloadAdjacent(currentPage);
})();
