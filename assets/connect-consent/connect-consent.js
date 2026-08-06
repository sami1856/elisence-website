(function () {
  "use strict";

  var API_BASE = "https://api.elisence.com";
  var SUBSCRIBE_URL = API_BASE + "/v8/connect/subscribe";
  var CONSENT_VERSION = "elisence-connect-consent-v1";

  var ALLOWED_SOURCES = {
    sam_card: true,
    shiva_card: true,
    connect_pwa: true,
    web_summit_2026: true,
    healthtech_event: true,
    direct: true,
    unknown: true
  };

  var INTERESTS = [
    { label: "Investment", key: "investment" },
    { label: "Strategic Partnership", key: "strategic_partnership" },
    { label: "Healthcare Systems", key: "healthcare_systems" },
    { label: "Technology & AI", key: "technology_ai" },
    { label: "Research", key: "research" },
    { label: "Events", key: "events" },
    { label: "General ELISENCE Updates", key: "general_updates" }
  ];

  var MEETING_OPTIONS = [
    { label: "Web Summit", key: "web_summit" },
    { label: "HealthTech Event", key: "healthtech_event" },
    { label: "Founder Event", key: "founder_event" },
    { label: "Online", key: "online" },
    { label: "Referred by someone", key: "referred" },
    { label: "Other", key: "other" }
  ];

  var CONSENT_TEXT =
    "I would like to receive occasional ELISENCE updates by email, including meaningful product, partnership, event and company milestone updates. I understand that I can unsubscribe at any time.";

  var state = "idle";
  var currentSource = "unknown";
  var lastFocus = null;
  var overlay = null;
  var formEl = null;
  var resultEl = null;
  var statusEl = null;
  var submitBtn = null;
  var selectedInterests = Object.create(null);

  function sanitizeSource(raw) {
    var value = String(raw || "").trim();
    return Object.prototype.hasOwnProperty.call(ALLOWED_SOURCES, value) ? value : "unknown";
  }

  function querySource() {
    try {
      return sanitizeSource(new URLSearchParams(window.location.search).get("source"));
    } catch (err) {
      return "unknown";
    }
  }

  function opaqueKey() {
    var bytes = new Uint8Array(24);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    var out = "";
    for (var j = 0; j < bytes.length; j++) {
      out += ("0" + bytes[j].toString(16)).slice(-2);
    }
    return "cc_" + out;
  }

  function isValidEmail(value) {
    var v = String(value || "").trim();
    if (!v || v.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function getFocusable(container) {
    return Array.prototype.slice
      .call(
        container.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return el.offsetParent !== null || el === container;
      });
  }

  function trapFocus(event) {
    if (!overlay || overlay.hidden) return;
    if (event.key !== "Tab") return;
    var focusable = getFocusable(overlay);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function setState(next) {
    state = next;
    syncSubmit();
  }

  function syncSubmit() {
    if (!submitBtn || !formEl) return;
    var consent = formEl.querySelector("#ecc-consent");
    var firstName = formEl.querySelector("#ecc-first-name");
    var lastName = formEl.querySelector("#ecc-last-name");
    var email = formEl.querySelector("#ecc-email");
    var organisation = formEl.querySelector("#ecc-organisation");
    var role = formEl.querySelector("#ecc-role");
    var meeting = formEl.querySelector("#ecc-meeting");

    var valid =
      state === "idle" &&
      firstName &&
      String(firstName.value || "").trim().length > 0 &&
      lastName &&
      String(lastName.value || "").trim().length > 0 &&
      email &&
      isValidEmail(email.value) &&
      organisation &&
      String(organisation.value || "").trim().length > 0 &&
      role &&
      String(role.value || "").trim().length > 0 &&
      meeting &&
      String(meeting.value || "").length > 0 &&
      consent &&
      consent.checked;

    submitBtn.disabled = !valid || state === "submitting" || state === "validating";
    submitBtn.setAttribute("aria-disabled", submitBtn.disabled ? "true" : "false");

    if (state === "submitting") {
      submitBtn.textContent = "SUBMITTING…";
    } else if (state === "validating") {
      submitBtn.textContent = "VALIDATING…";
    } else {
      submitBtn.textContent = "STAY CONNECTED";
    }
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success");
    if (kind) statusEl.classList.add("is-" + kind);
    statusEl.hidden = !message;
  }

  function showFormView() {
    if (formEl) formEl.hidden = false;
    if (resultEl) resultEl.hidden = true;
  }

  function showResultView(title, copy, success) {
    if (formEl) formEl.hidden = true;
    if (resultEl) {
      resultEl.hidden = false;
      var titleEl = resultEl.querySelector(".ecc-result__title");
      var copyEl = resultEl.querySelector(".ecc-result__copy");
      if (titleEl) titleEl.textContent = title;
      if (copyEl) copyEl.textContent = copy;
    }
    setStatus("", success ? "success" : "error");
    if (statusEl) {
      statusEl.textContent = title;
      statusEl.hidden = false;
      statusEl.classList.toggle("is-success", !!success);
      statusEl.classList.toggle("is-error", !success);
    }
  }

  function resetForm() {
    if (!formEl) return;
    formEl.reset();
    selectedInterests = Object.create(null);
    var chips = formEl.querySelectorAll(".ecc-chip");
    for (var i = 0; i < chips.length; i++) {
      chips[i].setAttribute("aria-pressed", "false");
    }
    var fields = formEl.querySelectorAll("[aria-invalid]");
    for (var j = 0; j < fields.length; j++) {
      fields[j].removeAttribute("aria-invalid");
    }
    showFormView();
    setStatus("");
    setState("idle");
  }

  function buildModal() {
    overlay = document.createElement("div");
    overlay.id = "ecc-overlay";
    overlay.className = "ecc-overlay";
    overlay.hidden = true;
    overlay.setAttribute("role", "presentation");

    var backdrop = document.createElement("div");
    backdrop.className = "ecc-overlay__backdrop";
    backdrop.setAttribute("data-ecc-close", "true");
    backdrop.tabIndex = -1;

    var sheet = document.createElement("div");
    sheet.className = "ecc-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "ecc-dialog-title");

    sheet.innerHTML =
      '<div class="ecc-sheet__header">' +
      '<h2 id="ecc-dialog-title" class="ecc-sheet__title">Stay Connected with ELISENCE</h2>' +
      '<p class="ecc-sheet__lead">Keep ELISENCE within reach.</p>' +
      '<p class="ecc-sheet__support">Receive meaningful updates about our mission to connect fragmented healthcare information into one understandable, longitudinal and trusted health journey.</p>' +
      "</div>" +
      '<div class="ecc-sheet__body">' +
      '<form id="ecc-form" class="ecc-form" novalidate>' +
      '<div class="ecc-field-row">' +
      '<div class="ecc-field"><label for="ecc-first-name">First name</label><input id="ecc-first-name" name="first_name" type="text" autocomplete="given-name" required /></div>' +
      '<div class="ecc-field"><label for="ecc-last-name">Last name</label><input id="ecc-last-name" name="last_name" type="text" autocomplete="family-name" required /></div>' +
      "</div>" +
      '<div class="ecc-field"><label for="ecc-email">Work email</label><input id="ecc-email" name="work_email" type="email" autocomplete="email" inputmode="email" required /></div>' +
      '<div class="ecc-field"><label for="ecc-organisation">Organisation</label><input id="ecc-organisation" name="organisation" type="text" autocomplete="organization" required /></div>' +
      '<div class="ecc-field"><label for="ecc-role">Role</label><input id="ecc-role" name="role" type="text" autocomplete="organization-title" required /></div>' +
      '<fieldset class="ecc-fieldset"><legend id="ecc-interests-legend">Interests</legend><div class="ecc-chips" role="group" aria-labelledby="ecc-interests-legend"></div></fieldset>' +
      '<div class="ecc-field"><label for="ecc-meeting">Meeting context</label><select id="ecc-meeting" name="meeting_context" required><option value="">Select context</option></select></div>' +
      '<div class="ecc-consent">' +
      '<input type="checkbox" id="ecc-consent" name="consent" value="yes" />' +
      '<label for="ecc-consent">' +
      CONSENT_TEXT +
      ' <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.' +
      "</label>" +
      "</div>" +
      '<input type="text" id="ecc-honeypot" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" class="ecc-visually-hidden" />' +
      "</form>" +
      '<div id="ecc-result" class="ecc-result" hidden>' +
      '<h3 class="ecc-result__title"></h3>' +
      '<p class="ecc-result__copy"></p>' +
      "</div>" +
      "</div>" +
      '<div class="ecc-sheet__footer">' +
      '<p id="ecc-live-status" class="ecc-status ecc-visually-hidden" aria-live="polite" aria-atomic="true"></p>' +
      '<p id="ecc-status" class="ecc-status" role="status" aria-live="polite"></p>' +
      '<button type="button" id="ecc-submit" class="ecc-btn ecc-btn--primary">STAY CONNECTED</button>' +
      '<button type="button" id="ecc-cancel" class="ecc-btn ecc-btn--ghost">NOT NOW</button>' +
      "</div>";

    overlay.appendChild(backdrop);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);

    formEl = sheet.querySelector("#ecc-form");
    resultEl = sheet.querySelector("#ecc-result");
    statusEl = sheet.querySelector("#ecc-status");
    submitBtn = sheet.querySelector("#ecc-submit");

    var chipsWrap = sheet.querySelector(".ecc-chips");
    INTERESTS.forEach(function (item) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "ecc-chip";
      chip.textContent = item.label;
      chip.setAttribute("data-interest", item.key);
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", function () {
        var pressed = chip.getAttribute("aria-pressed") === "true";
        chip.setAttribute("aria-pressed", pressed ? "false" : "true");
        if (pressed) {
          delete selectedInterests[item.key];
        } else {
          selectedInterests[item.key] = true;
        }
      });
      chipsWrap.appendChild(chip);
    });

    var meetingSelect = sheet.querySelector("#ecc-meeting");
    MEETING_OPTIONS.forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.key;
      opt.textContent = item.label;
      meetingSelect.appendChild(opt);
    });

    var liveStatus = sheet.querySelector("#ecc-live-status");

    formEl.addEventListener("input", syncSubmit);
    formEl.addEventListener("change", syncSubmit);

    submitBtn.addEventListener("click", handleSubmit);
    sheet.querySelector("#ecc-cancel").addEventListener("click", close);

    overlay.addEventListener("click", function (event) {
      if (event.target && event.target.getAttribute("data-ecc-close") === "true") {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!overlay || overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      trapFocus(event);
    });

    if (liveStatus) {
      var observer = new MutationObserver(function () {
        liveStatus.textContent = statusEl ? statusEl.textContent : "";
      });
      if (statusEl) {
        observer.observe(statusEl, { childList: true, characterData: true, subtree: true });
      }
    }
  }

  function validateFields() {
    var invalid = false;
    var checks = [
      { id: "ecc-first-name", test: function (v) { return v.length > 0; } },
      { id: "ecc-last-name", test: function (v) { return v.length > 0; } },
      { id: "ecc-email", test: function (v) { return isValidEmail(v); } },
      { id: "ecc-organisation", test: function (v) { return v.length > 0; } },
      { id: "ecc-role", test: function (v) { return v.length > 0; } },
      { id: "ecc-meeting", test: function (v) { return v.length > 0; } }
    ];

    checks.forEach(function (item) {
      var el = formEl.querySelector("#" + item.id);
      if (!el) return;
      var value = String(el.value || "").trim();
      var ok = item.test(value);
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) invalid = true;
    });

    var consent = formEl.querySelector("#ecc-consent");
    if (!consent || !consent.checked) invalid = true;

    return !invalid;
  }

  function collectPayload() {
    var interests = Object.keys(selectedInterests);
    return {
      first_name: String(formEl.querySelector("#ecc-first-name").value || "").trim(),
      last_name: String(formEl.querySelector("#ecc-last-name").value || "").trim(),
      work_email: String(formEl.querySelector("#ecc-email").value || "").trim(),
      organisation: String(formEl.querySelector("#ecc-organisation").value || "").trim(),
      role: String(formEl.querySelector("#ecc-role").value || "").trim(),
      interests: interests,
      meeting_context: String(formEl.querySelector("#ecc-meeting").value || "").trim(),
      source: currentSource,
      consent_wording_version: CONSENT_VERSION,
      idempotency_key: opaqueKey(),
      honeypot: String(formEl.querySelector("#ecc-honeypot").value || "")
    };
  }

  function handleSubmit() {
    if (state === "submitting" || state === "validating") return;
    setState("validating");
    setStatus("Checking your details…");

    if (!validateFields()) {
      setState("idle");
      setStatus("Please complete all required fields, enter a valid work email, and confirm consent.", "error");
      syncSubmit();
      return;
    }

    setState("submitting");
    setStatus("Submitting…");

    fetch(SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(collectPayload()),
      credentials: "omit",
      cache: "no-store"
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { status: res.status, data: data };
        });
      })
      .then(function (result) {
        if (result.status >= 200 && result.status < 300) {
          setState("success");
          showResultView(
            "Check your email",
            "We sent a confirmation link to your work email. Please confirm to complete your ELISENCE connection.",
            true
          );
          return;
        }
        if (result.status === 422) {
          setState("idle");
          setStatus("Please check your details and try again.", "error");
          return;
        }
        if (result.status === 429) {
          setState("idle");
          setStatus("Please wait a moment before trying again.", "error");
          return;
        }
        setState("failure");
        showResultView(
          "Something went wrong",
          "We could not complete your request right now. Please try again shortly or contact ELISENCE directly.",
          false
        );
      })
      .catch(function () {
        setState("failure");
        showResultView(
          "Something went wrong",
          "We could not complete your request right now. Please try again shortly or contact ELISENCE directly.",
          false
        );
      })
      .then(function () {
        syncSubmit();
      });
  }

  function open(source) {
    if (!overlay) buildModal();
    currentSource = sanitizeSource(source);
    resetForm();
    overlay.hidden = false;
    document.body.classList.add("ecc-modal-open");
    lastFocus = document.activeElement;
    var firstField = formEl.querySelector("#ecc-first-name");
    if (firstField) {
      window.requestAnimationFrame(function () {
        firstField.focus();
      });
    }
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("ecc-modal-open");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
    if (state !== "success") {
      resetForm();
    }
  }

  function bindTriggers() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-ecc-open], [data-source]");
      if (!trigger) return;
      if (!trigger.hasAttribute("data-ecc-open") && !trigger.classList.contains("ecc-stay-connected")) return;
      event.preventDefault();
      var source = trigger.getAttribute("data-source") || querySource();
      open(source);
    });
  }

  function init() {
    buildModal();
    bindTriggers();
    syncSubmit();

    var autoSource = querySource();
    if (autoSource !== "unknown" && /[?&]ecc=open(?:&|$)/.test(window.location.search)) {
      open(autoSource);
    }
  }

  window.ElisenceConnectConsent = {
    open: open,
    close: close
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
