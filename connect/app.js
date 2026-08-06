(function () {
  "use strict";

  var SW_URL = "/connect/service-worker.js";
  var CACHE_BUST = "elisence-connect-v2";

  var modal = document.getElementById("qrModal");
  var modalTitle = document.getElementById("modalTitle");
  var modalDestination = document.getElementById("modalDestination");
  var qrHost = document.getElementById("qrcode");
  var openLink = document.getElementById("openLink");
  var copyBtn = document.getElementById("copyLink");
  var shareBtn = document.getElementById("shareLink");
  var closeBtn = document.getElementById("closeModal");
  var installBtn = document.getElementById("installBtn");
  var iosHint = document.getElementById("iosHint");
  var toast = document.getElementById("toast");
  var statusLive = document.getElementById("statusLive");
  var lastFocus = null;
  var activeUrl = "";
  var activeTitle = "";
  var qrInstance = null;
  var deferredPrompt = null;
  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    statusLive.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function clearQr() {
    qrHost.innerHTML = "";
    qrInstance = null;
  }

  function renderQr(url) {
    clearQr();
    if (typeof QRCode === "undefined") {
      qrHost.textContent = "QR library unavailable.";
      return;
    }
    var size = Math.min(252, Math.floor(qrHost.clientWidth || 252));
    qrInstance = new QRCode(qrHost, {
      text: url,
      width: size,
      height: size,
      colorDark: "#02040a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  function openModal(title, url) {
    activeTitle = title;
    activeUrl = url;
    lastFocus = document.activeElement;
    modalTitle.textContent = title;
    modalDestination.textContent = url;
    openLink.href = url;
    openLink.setAttribute("aria-label", "Open " + title + " in a new tab");
    modal.hidden = false;
    document.body.classList.add("modal-open");
    renderQr(url);
    closeBtn.focus();
    statusLive.textContent = title + " QR code opened.";
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    clearQr();
    activeUrl = "";
    activeTitle = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function onMenuClick(event) {
    var btn = event.currentTarget;
    openModal(btn.getAttribute("data-title"), btn.getAttribute("data-url"));
  }

  document.querySelectorAll(".menu-btn").forEach(function (btn) {
    btn.addEventListener("click", onMenuClick);
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target && event.target.getAttribute("data-close") === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  copyBtn.addEventListener("click", async function () {
    if (!activeUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeUrl);
      } else {
        var ta = document.createElement("textarea");
        ta.value = activeUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Link copied");
    } catch (err) {
      showToast("Copy failed");
    }
  });

  shareBtn.addEventListener("click", async function () {
    if (!activeUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeTitle + " · ELISENCE",
          text: "ELISENCE Connect — " + activeTitle,
          url: activeUrl
        });
        showToast("Shared");
      } catch (err) {
        if (err && err.name !== "AbortError") {
          showToast("Share cancelled");
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(activeUrl);
      showToast("Link copied (share unavailable)");
    } catch (err2) {
      showToast("Share unavailable");
    }
  });

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    if (!isStandalone()) {
      installBtn.hidden = false;
    }
  });

  installBtn.addEventListener("click", async function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      var choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") {
        showToast("Installing ELISENCE Connect");
      }
    } catch (err) {
      /* ignore */
    }
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  window.addEventListener("appinstalled", function () {
    installBtn.hidden = true;
    iosHint.hidden = true;
    showToast("ELISENCE Connect installed");
  });

  if (isIos() && !isStandalone()) {
    iosHint.hidden = false;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register(SW_URL, { scope: "/connect/" })
        .then(function (reg) {
          statusLive.textContent = "Offline shell ready.";
          if (reg && reg.update) {
            reg.update();
          }
        })
        .catch(function () {
          statusLive.textContent = "Service worker unavailable.";
        });
    });
  }

  // Quiet unused marker for cache audits
  window.__ELISENCE_CONNECT__ = CACHE_BUST;
})();
