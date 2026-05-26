(function () {
  const API_BASE = "https://elisence-elisa-backend.onrender.com";

  // ---------- UI ----------
  const btn = document.createElement("button");
  btn.id = "elisa-fab";
  btn.textContent = "Ask Elisa";
  btn.style.cssText =
    "position:fixed;right:18px;bottom:18px;z-index:99999;padding:12px 14px;border-radius:999px;border:0;cursor:pointer;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.25);";

  const panel = document.createElement("div");
  panel.id = "elisa-panel";
  panel.style.cssText =
    "position:fixed;right:18px;bottom:70px;width:340px;max-width:92vw;height:420px;max-height:70vh;background:#fff;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,.25);z-index:99999;display:none;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;";

  const header = document.createElement("div");
  header.style.cssText =
    "height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;background:#111;color:#fff;";
  header.innerHTML = `<div style="font-weight:700">Elisa</div>`;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.cssText =
    "background:transparent;color:#fff;border:0;font-size:22px;cursor:pointer;line-height:1;";
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.style.cssText =
    "height:calc(100% - 44px - 54px);padding:10px;overflow:auto;background:#fafafa;";

  const footer = document.createElement("div");
  footer.style.cssText =
    "height:54px;display:flex;gap:8px;padding:8px;border-top:1px solid #eee;background:#fff;";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your message...";
  input.style.cssText =
    "flex:1;padding:10px;border-radius:10px;border:1px solid #ddd;outline:none;";

  const send = document.createElement("button");
  send.textContent = "Send";
  send.style.cssText =
    "padding:10px 12px;border-radius:10px;border:0;cursor:pointer;font-weight:700;";

  footer.appendChild(input);
  footer.appendChild(send);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  function addMsg(role, text) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "margin:8px 0;display:flex;";
    const bubble = document.createElement("div");
    bubble.style.cssText =
      "max-width:85%;padding:10px 12px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word;font-size:14px;line-height:1.35;";
    if (role === "user") {
      wrap.style.justifyContent = "flex-end";
      bubble.style.background = "#111";
      bubble.style.color = "#fff";
    } else {
      wrap.style.justifyContent = "flex-start";
      bubble.style.background = "#fff";
      bubble.style.border = "1px solid #eee";
      bubble.style.color = "#111";
    }
    bubble.textContent = text;
    wrap.appendChild(bubble);
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  async function sendMsg() {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    addMsg("user", msg);

    try {
      const res = await fetch(`${API_BASE}/elisa/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        addMsg("elisa", `Error ${res.status}: ${JSON.stringify(data)}`);
        return;
      }
      addMsg("elisa", data.reply || "No reply field returned.");
    } catch (e) {
      addMsg("elisa", "Network error. Please try again.");
    }
  }

  btn.addEventListener("click", () => {
    panel.style.display = "block";
    btn.style.display = "none";
    if (body.childElementCount === 0) {
      addMsg("elisa", "Hi! I’m Elisa. How can I help?");
    }
    input.focus();
  });

  closeBtn.addEventListener("click", () => {
    panel.style.display = "none";
    btn.style.display = "block";
  });

  send.addEventListener("click", sendMsg);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMsg();
  });
})();
