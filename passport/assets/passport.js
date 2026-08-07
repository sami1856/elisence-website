/* ELISENCE Relationships Passport — shared UI shell (frontend only) */
(function () {
  "use strict";

  var NAV = [
    { href: "/passport/", label: "Overview", key: "overview" },
    { href: "/passport/relationships/", label: "Relationships", key: "relationships" },
    { href: "/passport/segments/", label: "Segments", key: "segments" },
    { href: "/passport/campaigns/", label: "Campaigns", key: "campaigns" },
    { href: "/passport/analytics/", label: "Analytics", key: "analytics" },
    { href: "/passport/consent/", label: "Consent", key: "consent" },
    { href: "/passport/audit/", label: "Audit", key: "audit" }
  ];

  function activeKey() {
    return document.body.getAttribute("data-pp-page") || "overview";
  }

  function buildNav() {
    var key = activeKey();
    var links = NAV.map(function (item) {
      var active = item.key === key ? " is-active" : "";
      return (
        '<a class="pp-nav__link' + active + '" href="' + item.href + '">' +
        '<span class="pp-nav__dot" aria-hidden="true"></span>' +
        item.label +
        "</a>"
      );
    }).join("");

    return (
      '<aside class="pp-nav" id="pp-nav" aria-label="Passport navigation">' +
      '<div class="pp-brand">' +
      '<span class="pp-brand__orb" aria-hidden="true"></span>' +
      '<div><div class="pp-brand__name">ELISENCE</div>' +
      '<div class="pp-brand__sub">Relationships Passport</div></div>' +
      "</div>" +
      '<div class="pp-nav__label">Navigate</div>' +
      links +
      '<div class="pp-nav__foot">' +
      "Governed Relationship Intelligence<br />" +
      '<span class="pp-nav__badge">UI sample · not live engine</span>' +
      "</div>" +
      "</aside>"
    );
  }

  function ensureShell() {
    if (document.querySelector(".pp-shell")) return;
    var main = document.querySelector("[data-pp-main]");
    if (!main) return;
    var mobile =
      '<div class="pp-mobile-nav">' +
      '<button type="button" class="pp-mobile-nav__btn" id="pp-nav-toggle">Menu</button>' +
      "</div>";
    var shell = document.createElement("div");
    shell.className = "pp-shell";
    shell.innerHTML = buildNav() + '<div class="pp-content-wrap"></div>';
    var wrap = shell.querySelector(".pp-content-wrap");
    main.parentNode.insertBefore(document.createRange().createContextualFragment(mobile), main);
    main.parentNode.insertBefore(shell, main);
    wrap.appendChild(main);
  }

  function bindMobileNav() {
    var btn = document.getElementById("pp-nav-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      document.body.classList.toggle("pp-nav-open");
      btn.setAttribute("aria-expanded", document.body.classList.contains("pp-nav-open") ? "true" : "false");
    });
    document.addEventListener("click", function (event) {
      if (!document.body.classList.contains("pp-nav-open")) return;
      var nav = document.getElementById("pp-nav");
      if (nav && (nav.contains(event.target) || (btn && btn.contains(event.target)))) return;
      document.body.classList.remove("pp-nav-open");
    });
  }

  function maxCount(rows) {
    var m = 1;
    rows.forEach(function (r) {
      if (r.count > m) m = r.count;
    });
    return m;
  }

  function renderBars(container, rows, green) {
    if (!container) return;
    var max = maxCount(rows);
    container.innerHTML = rows
      .map(function (row) {
        var pct = Math.round((row.count / max) * 100);
        return (
          '<div class="pp-bar-row">' +
          '<div class="pp-bar-row__label">' +
          escapeHtml(row.name) +
          "</div>" +
          '<div class="pp-bar-row__value">' +
          row.count +
          "</div>" +
          '<div class="pp-bar-track"><div class="pp-bar-fill' +
          (green ? " pp-bar-fill--green" : "") +
          '" style="width:' +
          pct +
          '%"></div></div>' +
          "</div>"
        );
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusChip(status) {
    var tone = "muted";
    if (status === "Confirmed") tone = "ok";
    else if (status === "Pending Confirmation") tone = "pending";
    else if (status === "Unsubscribed") tone = "muted";
    else if (status === "Suppressed" || status === "Bounced") tone = "danger";
    return '<span class="pp-chip pp-chip--' + tone + '">' + escapeHtml(status) + "</span>";
  }

  function qs(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  window.ElisencePassportUI = {
    ensureShell: ensureShell,
    bindMobileNav: bindMobileNav,
    renderBars: renderBars,
    statusChip: statusChip,
    escapeHtml: escapeHtml,
    qs: qs
  };

  document.addEventListener("DOMContentLoaded", function () {
    ensureShell();
    bindMobileNav();
  });
})();
