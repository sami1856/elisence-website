(function () {
  // === CONFIG ===
  const BACKEND_URL = "/api/elisa/chat"; // بعداً بک‌اند واقعی به این آدرس متصل می‌شود
  const WIDGET_TITLE = "Elisa — Your Kind Companion";
  const WIDGET_SUBTITLE = "Gentle, non-diagnostic conversations only.";

  // === STATE ===
  let isOpen = false;
  let isSending = false;
  let sessionId = null;
  let hasShownWelcome = false;

  let rootEl = null;
  let buttonEl = null;
  let panelEl = null;
  let messagesEl = null;
  let inputEl = null;
  let sendBtnEl = null;
  let statusEl = null;

  document.addEventListener("DOMContentLoaded", function () {
    rootEl = document.getElementById("elisa-chat-root");
    if (!rootEl) {
      console.warn("[ElisaChat] #elisa-chat-root not found.");
      return;
    }
    injectStyles();
    createWidget();
  });

  function injectStyles() {
    const style = document.createElement("style");
    style.setAttribute("data-elisa-chat-style", "1");
    style.innerHTML = `
      #elisa-chat-root {
        position: fixed;
        inset: auto 16px 16px auto;
        z-index: 9999;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .elisa-chat-button {
        width: 260px;
        height: 80px;
        border-radius: 999px;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        background-color: transparent;
        background-image: url("elisa.jpeg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        box-shadow: none;
        outline: none;
        transition: transform 0.15s ease;
      }

      .elisa-chat-button:hover {
        transform: scale(1.02);
      }

      .elisa-chat-button:active {
        transform: scale(0.99);
      }

      .elisa-chat-panel {
        position: fixed;
        inset: auto 16px 104px auto;
        width: 320px;
        max-height: 420px;
        background: #050816;
        color: #ffffff;
        border-radius: 16px;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }

      .elisa-chat-panel.open {
        display: flex;
      }

      .elisa-chat-header {
        padding: 12px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .elisa-chat-header-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .elisa-chat-header-title {
        font-size: 14px;
        font-weight: 600;
      }

      .elisa-chat-header-subtitle {
        font-size: 11px;
        opacity: 0.8;
      }

      .elisa-chat-close-btn {
        border: none;
        background: transparent;
        color: #ffffff;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }

      .elisa-chat-messages {
        flex: 1;
        padding: 10px 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 13px;
      }

      .elisa-chat-message {
        max-width: 90%;
        padding: 8px 10px;
        border-radius: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .elisa-chat-message.user {
        margin-left: auto;
        background: #1f2937;
      }

      .elisa-chat-message.elisa {
        margin-right: auto;
        background: radial-gradient(circle at 20% 20%, #00c6ff, #0040ff);
      }

      .elisa-chat-footer {
        padding: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .elisa-chat-input-row {
        display: flex;
        gap: 6px;
      }

      .elisa-chat-input {
        flex: 1;
        padding: 6px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: #020617;
        color: #ffffff;
        font-size: 13px;
      }

      .elisa-chat-input::placeholder {
        color: rgba(156, 163, 175, 0.9);
      }

      .elisa-chat-send-btn {
        padding: 6px 10px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: #2563eb;
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }

      .elisa-chat-send-btn:disabled {
        opacity: 0.6;
        cursor: default;
      }

      .elisa-chat-status {
        font-size: 11px;
        min-height: 14px;
        color: rgba(156, 163, 175, 0.9);
      }

      .elisa-chat-status.error {
        color: #fca5a5;
      }

      @media (max-width: 480px) {
        .elisa-chat-panel {
          inset: auto 8px 96px 8px;
          width: auto;
          max-height: 60vh;
        }

        #elisa-chat-root {
          inset: auto 8px 8px auto;
        }

        .elisa-chat-button {
          width: 220px;
          height: 68px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createWidget() {
    buttonEl = document.createElement("button");
    buttonEl.className = "elisa-chat-button";
    buttonEl.type = "button";
    buttonEl.addEventListener("click", togglePanel);

    panelEl = document.createElement("div");
    panelEl.className = "elisa-chat-panel";

    const headerEl = document.createElement("div");
    headerEl.className = "elisa-chat-header";

    const headerLeft = document.createElement("div");
    headerLeft.className = "elisa-chat-header-left";

    const titleEl = document.createElement("div");
    titleEl.className = "elisa-chat-header-title";
    titleEl.textContent = WIDGET_TITLE;

    const subtitleEl = document.createElement("div");
    subtitleEl.className = "elisa-chat-header-subtitle";
    subtitleEl.textContent = WIDGET_SUBTITLE;

    headerLeft.appendChild(titleEl);
    headerLeft.appendChild(subtitleEl);

    const closeBtn = document.createElement("button");
    closeBtn.className = "elisa-chat-close-btn";
    closeBtn.type = "button";
    closeBtn.innerHTML = "×";
    closeBtn.addEventListener("click", closePanel);

    headerEl.appendChild(headerLeft);
    headerEl.appendChild(closeBtn);

    messagesEl = document.createElement("div");
    messagesEl.className = "elisa-chat-messages";

    const footerEl = document.createElement("div");
    footerEl.className = "elisa-chat-footer";

    const inputRow = document.createElement("div");
    inputRow.className = "elisa-chat-input-row";

    inputEl = document.createElement("input");
    inputEl.className = "elisa-chat-input";
    inputEl.type = "text";
    inputEl.placeholder = "Ask Elisa about your day, stress, health, or Elisence…";

    inputEl.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        handleSend();
      }
    });

    sendBtnEl = document.createElement("button");
    sendBtnEl.className = "elisa-chat-send-btn";
    sendBtnEl.type = "button";
    sendBtnEl.textContent = "Send";
    sendBtnEl.addEventListener("click", handleSend);

    inputRow.appendChild(inputEl);
    inputRow.appendChild(sendBtnEl);

    statusEl = document.createElement("div");
    statusEl.className = "elisa-chat-status";
    statusEl.textContent = "";

    footerEl.appendChild(inputRow);
    footerEl.appendChild(statusEl);

    panelEl.appendChild(headerEl);
    panelEl.appendChild(messagesEl);
    panelEl.appendChild(footerEl);

    rootEl.appendChild(buttonEl);
    rootEl.appendChild(panelEl);
  }

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    isOpen = true;
    panelEl.classList.add("open");
    if (!hasShownWelcome) {
      showWelcomeMessage();
      hasShownWelcome = true;
    }
    setTimeout(function () {
      if (inputEl) {
        inputEl.focus();
      }
    }, 50);
  }

  function closePanel() {
    isOpen = false;
    panelEl.classList.remove("open");
  }

  function appendMessage(role, text) {
    if (!messagesEl) return;
    const bubble = document.createElement("div");
    bubble.className = "elisa-chat-message " + (role === "user" ? "user" : "elisa");
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showWelcomeMessage() {
    const msg =
      "Hi, I’m Elisa. I cannot diagnose or replace a doctor, but I can be your kind companion and help you think about your day, your wellbeing, and how Elisence works.";
    appendMessage("elisa", msg);
  }

  function handleSend() {
    if (!inputEl || !inputEl.value.trim() || isSending) {
      return;
    }
    const text = inputEl.value.trim();
    inputEl.value = "";
    appendMessage("user", text);
    sendToBackend(text);
  }

  function setStatus(text, isError) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    if (isError) {
      statusEl.classList.add("error");
    } else {
      statusEl.classList.remove("error");
    }
  }

  function generateSessionId() {
    if (sessionId) return sessionId;
    try {
      sessionId = crypto.randomUUID();
    } catch (e) {
      sessionId = "elisa-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
    }
    return sessionId;
  }

  function sendToBackend(messageText) {
    isSending = true;
    if (sendBtnEl) sendBtnEl.disabled = true;
    setStatus("Elisa is thinking…", false);

    const sid = generateSessionId();
    const payload = {
      session_id: sid,
      message: messageText,
      language: "en",
      page: window.location.pathname || "/"
    };

    fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) {
          appendMessage(
            "elisa",
            "Elisa is temporarily unavailable. Please try again in a few minutes."
          );
          setStatus("Service temporarily unavailable.", true);
          return;
        }
        const reply = data.reply || "...";
        appendMessage("elisa", reply);
        setStatus("", false);
      })
      .catch(function () {
        appendMessage(
          "elisa",
          "I’m having trouble connecting right now. Please try again in a few moments."
        );
        setStatus("Network or server error.", true);
      })
      .finally(function () {
        isSending = false;
        if (sendBtnEl) sendBtnEl.disabled = false;
      });
  }
})();
