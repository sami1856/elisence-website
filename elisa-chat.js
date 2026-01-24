// elisa-chat.js
// Scenario C – Final clean version (TOP-RIGHT launcher)

// TODO: بعد از آماده شدن بک‌اند، فقط این آدرس را عوض کن:
const ELISA_API_URL = "https://YOUR-ELISA-BACKEND-DOMAIN/elisa/chat";

// ----------------------------------------------------
// DOM helpers
// ----------------------------------------------------
function createElisaLauncher() {
  const launcher = document.createElement("button");
  launcher.id = "elisa-launcher";
  launcher.type = "button";

  launcher.innerHTML = `
    <div class="elisa-launcher-inner">
      <img src="elisa.jpeg" alt="Elisa avatar" class="elisa-avatar" />
      <div class="elisa-text-block">
        <div class="elisa-name">Elisa</div>
        <div class="elisa-tagline">Talk to me</div>
      </div>
    </div>
  `;

  document.body.appendChild(launcher);
  return launcher;
}

function createElisaChatPanel() {
  const panel = document.createElement("div");
  panel.id = "elisa-chat-panel";

  panel.innerHTML = `
    <div class="elisa-chat-header">
      <div class="elisa-header-left">
        <img src="elisa.jpeg" alt="Elisa avatar" class="elisa-avatar small" />
        <div class="elisa-header-texts">
          <div class="elisa-name">Elisa</div>
          <div class="elisa-subtitle">Your kind companion</div>
        </div>
      </div>
      <button type="button" class="elisa-close-btn" aria-label="Close">
        ✕
      </button>
    </div>

    <div class="elisa-chat-body">
      <div class="elisa-messages" id="elisa-messages"></div>
    </div>

    <div class="elisa-chat-footer">
      <textarea
        id="elisa-input"
        class="elisa-input"
        rows="1"
        placeholder="Ask Elisa about your day, your health journey or Elisence itself…"
      ></textarea>
      <button type="button" id="elisa-send-btn" class="elisa-send-btn">
        Send
      </button>
    </div>
  `;

  document.body.appendChild(panel);
  return panel;
}

// ----------------------------------------------------
// Message helpers
// ----------------------------------------------------
function addMessage(role, text) {
  const container = document.getElementById("elisa-messages");
  if (!container) return;

  const row = document.createElement("div");
  row.className = "elisa-message-row elisa-" + role;

  const bubble = document.createElement("div");
  bubble.className = "elisa-bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function setTyping(isTyping) {
  const container = document.getElementById("elisa-messages");
  if (!container) return;

  const existing = document.getElementById("elisa-typing");

  if (isTyping) {
    if (existing) return;
    const row = document.createElement("div");
    row.id = "elisa-typing";
    row.className = "elisa-message-row elisa-elisa";

    const bubble = document.createElement("div");
    bubble.className = "elisa-bubble typing";
    bubble.textContent = "Elisa is thinking…";

    row.appendChild(bubble);
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  } else if (existing) {
    existing.remove();
  }
}

// ----------------------------------------------------
// Backend call
// ----------------------------------------------------
let elisaSessionId = null;

async function sendToElisaBackend(messageText) {
  const payload = {
    message: messageText,
    session_id: elisaSessionId,
    language: "en",
    page: window.location.pathname || ""
  };

  try {
    const response = await fetch(ELISA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const data = await response.json();
    elisaSessionId = data.session_id || elisaSessionId;

    const reply =
      data.reply ||
      data.message ||
      "Elisa is temporarily unavailable. Please try again later.";

    const safety = data.safety_level || "safe";
    return { reply, safety };
  } catch (err) {
    console.error("Elisa backend error:", err);
    return {
      reply:
        "Elisa is temporarily unavailable. Please try again in a few minutes.",
      safety: "warning"
    };
  }
}

// ----------------------------------------------------
// Wire up (styles + events)
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  // Inject styles (همه صفحات)
  const style = document.createElement("style");
  style.textContent = `
    /* Launcher – DESKTOP: top right, اندازه اصلی */
    #elisa-launcher {
      position: fixed;
      right: 18px;
      top: 18px;
      bottom: auto;
      z-index: 1200;
      border: none;
      border-radius: 999px;
      padding: 6px 14px 6px 6px;
      background: radial-gradient(circle at top left, #4fd3ff, #5b3bff);
      box-shadow:
        0 0 18px rgba(0, 180, 255, 0.95),
        0 0 34px rgba(90, 80, 255, 0.9);
      cursor: pointer;
      color: #ffffff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #elisa-launcher:hover {
      transform: translateY(-1px);
      box-shadow:
        0 0 24px rgba(0, 210, 255, 1),
        0 0 40px rgba(100, 90, 255, 1);
    }

    .elisa-launcher-inner {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .elisa-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
    }

    .elisa-avatar.small {
      width: 28px;
      height: 28px;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.7);
    }

    .elisa-text-block {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }

    .elisa-name {
      font-size: 14px;
      font-weight: 600;
    }

    .elisa-tagline {
      font-size: 11px;
      opacity: 0.9;
    }

    /* Chat panel */
    #elisa-chat-panel {
      position: fixed;
      right: 18px;
      bottom: 80px;
      width: 320px;
      max-height: 480px;
      background: radial-gradient(circle at top, #061632, #020815);
      border-radius: 18px;
      box-shadow:
        0 0 24px rgba(0, 180, 255, 1),
        0 0 60px rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(110, 190, 255, 0.9);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 1200;
      color: #f3f6ff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .elisa-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-bottom: 1px solid rgba(120, 190, 255, 0.5);
      background: linear-gradient(135deg, rgba(0, 180, 255, 0.3), rgba(40, 10, 90, 0.9));
    }

    .elisa-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .elisa-header-texts {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .elisa-subtitle {
      font-size: 11px;
      opacity: 0.9;
    }

    .elisa-close-btn {
      background: transparent;
      border: none;
      color: #f8fbff;
      font-size: 16px;
      cursor: pointer;
    }

    .elisa-chat-body {
      flex: 1;
      padding: 8px 10px;
      overflow-y: auto;
      background: radial-gradient(circle at top left, #040c1c, #02040a);
    }

    .elisa-messages {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 13px;
    }

    .elisa-message-row {
      display: flex;
    }

    .elisa-user {
      justify-content: flex-end;
    }

    .elisa-elisa {
      justify-content: flex-start;
    }

    .elisa-bubble {
      max-width: 80%;
      padding: 6px 10px;
      border-radius: 14px;
    }

    .elisa-user .elisa-bubble {
      background: linear-gradient(135deg, #00a8ff, #006eff);
      color: #ffffff;
    }

    .elisa-elisa .elisa-bubble {
      background: rgba(20, 40, 80, 0.95);
      border: 1px solid rgba(120, 190, 255, 0.7);
      color: #e9f3ff;
    }

    .elisa-bubble.typing {
      font-style: italic;
      opacity: 0.9;
    }

    .elisa-chat-footer {
      padding: 8px 10px;
      border-top: 1px solid rgba(120, 190, 255, 0.5);
      background: #050a16;
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .elisa-input {
      flex: 1;
      resize: none;
      border-radius: 10px;
      border: 1px solid rgba(120, 190, 255, 0.8);
      background: rgba(2, 8, 20, 0.95);
      color: #f3f6ff;
      font-size: 13px;
      padding: 6px 8px;
      outline: none;
    }

    .elisa-send-btn {
      border-radius: 999px;
      border: none;
      padding: 6px 12px;
      background: linear-gradient(135deg, #00b4ff, #0075ff);
      color: #ffffff;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 0 14px rgba(0, 160, 255, 0.9);
    }

    .elisa-send-btn:disabled {
      opacity: 0.5;
      cursor: default;
      box-shadow: none;
    }

    /* Mobile tweaks: فقط کمی جابه‌جایی، نه کوچک کردن */
    @media (max-width: 520px) {
      #elisa-chat-panel {
        right: 10px;
        left: 10px;
        width: auto;
      }
      #elisa-launcher {
        right: 10px;
        top: 12px;
      }
    }
  `;
  document.head.appendChild(style);

  const launcher = createElisaLauncher();
  const panel = createElisaChatPanel();
  const closeBtn = panel.querySelector(".elisa-close-btn");
  const input = document.getElementById("elisa-input");
  const sendBtn = document.getElementById("elisa-send-btn");

  function openChat() {
    panel.style.display = "flex";
    if (input) input.focus();

    const hasMessages =
      (document.getElementById("elisa-messages")?.children.length || 0) > 0;

    if (!hasMessages) {
      addMessage(
        "elisa",
        "Hi, I’m Elisa. I’m here as a kind companion. I can’t diagnose or prescribe, but we can think through your day, your health journey and Elisence together."
      );
    }
  }

  function closeChat() {
    panel.style.display = "none";
  }

  launcher.addEventListener("click", openChat);
  if (closeBtn) {
    closeBtn.addEventListener("click", closeChat);
  }

  function handleSend() {
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = "";
    input.style.height = "auto";

    addMessage("user", text);
    setTyping(true);
    sendBtn.disabled = true;

    sendToElisaBackend(text).then(({ reply }) => {
      setTyping(false);
      addMessage("elisa", reply);
      sendBtn.disabled = false;
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", handleSend);
  }

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    });

    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 80) + "px";
    });
  }
});
