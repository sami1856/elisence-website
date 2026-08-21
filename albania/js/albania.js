(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  const header = document.querySelector(".site-header");
  const navItems = document.querySelectorAll("[data-nav-item]");

  const setOpen = (open) => {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 900px)").matches) {
          setOpen(false);
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!window.matchMedia("(max-width: 900px)").matches) return;
      if (header && header.contains(event.target)) return;
      setOpen(false);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 900px)").matches) {
        setOpen(false);
      }
    });
  }

  // Lightweight active-state handoff for future sections (no scrollspy).
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((other) => {
        other.classList.remove("is-active");
        other.removeAttribute("aria-current");
      });
      item.classList.add("is-active");
      item.setAttribute("aria-current", "page");
    });
  });

  // Safe handling for future anchors that do not yet exist as full sections.
  document.querySelectorAll('[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") {
        event.preventDefault();
        return;
      }

      const target = document.querySelector(id);
      if (!target) {
        event.preventDefault();
      }
    });
  });

  // One-time section entrance for Founder Note + Manifesto Block 03.
  // Tall manifesto must use a near-zero threshold: 0.18 of a multi-viewport
  // section can never fit, which left all panels stuck at opacity:0.
  const revealNodes = document.querySelectorAll("[data-reveal]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const reveal = (node) => node.classList.add("is-visible");

    const shortObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    const tallObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" }
    );

    revealNodes.forEach((node) => {
      if (node.classList.contains("manifesto") || node.classList.contains("albania-manifesto")) {
        tallObserver.observe(node);
      } else {
        shortObserver.observe(node);
      }
    });
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }
})();

(() => {
  // Interactive EIT Pitch Deck (approved slide images + HTML controls)
  const deckRoot = document.querySelector("[data-deck]");
  if (!deckRoot) return;

  const order = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];
  const figures = Array.from(deckRoot.querySelectorAll("[data-deck-slide]"));
  const gotoButtons = Array.from(deckRoot.querySelectorAll("[data-deck-goto]"));
  const prevBtn = deckRoot.querySelector("[data-deck-prev]");
  const nextBtn = deckRoot.querySelector("[data-deck-next]");
  const statusEl = deckRoot.querySelector("[data-deck-status]");
  let current = "01";

  const hashFor = (key) => (key === "01" ? "#eit-pitch" : `#eit-pitch-${key}`);

  const keyFromHash = (hash) => {
    if (!hash || hash === "#eit-pitch" || hash === "#eit-pitch-menu" || hash === "#eit-pitch-01") return "01";
    const match = /^#eit-pitch-(\d{2})$/.exec(hash);
    if (match && order.includes(match[1])) return match[1];
    return "01";
  };

  const setSlide = (key, { updateHash = true } = {}) => {
    if (!order.includes(key)) return;
    current = key;
    const idx = order.indexOf(key);

    figures.forEach((fig) => {
      const active = fig.getAttribute("data-deck-slide") === key;
      fig.classList.toggle("is-active", active);
      if (active) fig.removeAttribute("hidden");
      else fig.setAttribute("hidden", "");
    });

    gotoButtons.forEach((btn) => {
      const active = btn.getAttribute("data-deck-goto") === key;
      btn.classList.toggle("is-active", active);
      if (active) btn.setAttribute("aria-current", "true");
      else btn.removeAttribute("aria-current");
    });

    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === order.length - 1;
    if (statusEl) statusEl.textContent = `${key} / 11`;

    if (updateHash) {
      const nextHash = hashFor(key);
      if (location.hash !== nextHash) {
        history.pushState({ deck: key }, "", nextHash);
      }
    }
  };

  const showFromHash = () => {
    if (!location.hash.startsWith("#eit-pitch")) return;
    setSlide(keyFromHash(location.hash), { updateHash: false });
  };

  const goTo = (key) => {
    setSlide(key);
  };

  deckRoot.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-deck-goto]") : null;
    if (!target || !deckRoot.contains(target)) return;
    event.preventDefault();
    goTo(target.getAttribute("data-deck-goto"));
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const idx = order.indexOf(current);
      if (idx > 0) goTo(order[idx - 1]);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const idx = order.indexOf(current);
      if (idx >= 0 && idx < order.length - 1) goTo(order[idx + 1]);
    });
  }

  window.addEventListener("keydown", (event) => {
    if (!location.hash.startsWith("#eit-pitch")) return;
    const typing = event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']");
    if (typing) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const idx = order.indexOf(current);
      if (idx > 0) goTo(order[idx - 1]);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const idx = order.indexOf(current);
      if (idx >= 0 && idx < order.length - 1) goTo(order[idx + 1]);
    }
  });

  window.addEventListener("hashchange", showFromHash);
  window.addEventListener("popstate", showFromHash);

  if (location.hash.startsWith("#eit-pitch")) showFromHash();
  else setSlide("01", { updateHash: false });

  document.querySelectorAll('a[href="#eit-pitch"]').forEach((link) => {
    link.addEventListener("click", () => {
      setSlide("01", { updateHash: false });
    });
  });
})();
