// Elisa Web Widget (front-only mock version)
// This file only runs on the static Elisence website.
// It shows a floating button with Elisa's avatar and a small chat panel
// and replies with safe, non-diagnostic demo messages (no backend yet).

(function () {
    function onReady(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    onReady(function () {
        // ---------- 1) Base container ----------
        var root = document.createElement("div");
        root.id = "elisa-widget-root";
        document.body.appendChild(root);

        // ---------- 2) Inject minimal styles ----------
        var style = document.createElement("style");
        style.type = "text/css";
        style.textContent = ""
            + "#elisa-widget-root {"
            + "  position: fixed;"
            + "  right: 24px;"
            + "  bottom: 24px;"
            + "  z-index: 9999;"
            + "  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"
            + "}"
            + ".elisa-launcher {"
            + "  display: inline-flex;"
            + "  align-items: center;"
            + "  gap: 8px;"
            + "  padding: 8px 14px 8px 8px;"
            + "  border-radius: 999px;"
            + "  border: 1px solid rgba(120, 200, 255, 0.9);"
            + "  background: radial-gradient(circle at top left, rgba(0, 190, 255, 0.9), rgba(0, 30, 80, 0.96));"
            + "  box-shadow: 0 0 18px rgba(0, 180, 255, 0.9);"
            + "  color: #ffffff;"
            + "  cursor: pointer;"
            + "  transition: transform 0.15s ease, box-shadow 0.15s ease;"
            + "}"
            + ".elisa-launcher:hover {"
            + "  transform: translateY(-1px);"
            + "  box-shadow: 0 0 26px rgba(0, 220, 255, 1);"
            + "}"
            + ".elisa-launcher-avatar {"
            + "  width: 40px;"
            + "  height: 40px;"
            + "  border-radius: 50%;"
            + "  overflow: hidden;"
            + "  flex-shrink: 0;"
            + "  box-shadow: 0 0 14px rgba(0, 180, 255, 0.9);"
            + "}"
            + ".elisa-launcher-avatar img {"
            + "  width: 100%;"
            + "  height: 100%;"
            + "  object-fit: cover;"
            + "  display: block;"
            + "}"
            + ".elisa-launcher-texts {"
            + "  display: flex;"
            + "  flex-direction: column;"
            + "  line-height: 1.2;"
            + "}"
            + ".elisa-launcher-title {"
            + "  font-size: 13px;"
            + "  font-weight: 600;"
            + "}"
            + ".elisa-launcher-sub {"
            + "  font-size: 11px;"
            + "  opacity: 0.9;"
            + "}"
            + ".elisa-panel {"
            + "  position: fixed;"
            + "  right: 24px;"
            + "  bottom: 82px;"
            + "  width: 320px;"
            + "  max-height: 420px;"
            + "  display: none;"
            + "  flex-direction: column;"
            + "  border-radius: 20px;"
            + "  background: radial-gradient(circle at top, rgba(0, 160, 255, 0.95), rgba(0, 8, 30, 0.98));"
            + "  box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);"
            + "  overflow: hidden;"
            + "  border: 1px solid rgba(120, 200, 255, 0.9);"
            + "}"
            + ".elisa-panel-header {"
            + "  display: flex;"
            + "  align-items: center;"
            + "  justify-content: space-between;"
            + "  padding: 10px 12px;"
            + "  border-bottom: 1px solid rgba(120, 200, 255, 0.5);"
            + "}"
            + ".elisa-panel-header-left {"
            + "  display: flex;"
            + "  align-items: center;"
            + "  gap: 8px;"
            + "}"
            + ".elisa-panel-header-avatar {"
            + "  width: 30px;"
            + "  height: 30px;"
            + "  border-radius: 50%;"
            + "  overflow: hidden;"
            + "  box-shadow: 0 0 12px rgba(0, 200, 255, 0.9);"
            + "}"
            + ".elisa-panel-header-avatar img {"
            + "  width: 100%;"
            + "  height: 100%;"
            + "  object-fit: cover;"
            + "  display: block;"
            + "}"
            + ".elisa-panel-header-texts {"
            + "  display: flex;"
            + "  flex-direction: column;"
            + "}"
            + ".elisa-panel-header-title {"
            + "  font-size: 13px;"
            + "  font-weight: 600;"
            + "}"
            + ".elisa-panel-header-sub {"
            + "  font-size: 11px;"
            + "  color: #d5ecff;"
            + "  opacity: 0.9;"
            + "}"
            + ".elisa-panel-close {"
            + "  border: none;"
            + "  background: transparent;"
            + "  color: #e4f3ff;"
            + "  font-size: 16px;"
            + "  cursor: pointer;"
            + "}"
            + ".elisa-panel-messages {"
            + "  flex: 1 1 auto;"
            + "  padding: 10px 10px 4px 10px;"
            + "  overflow-y: auto;"
            + "  font-size: 12px;"
            + "  background: radial-gradient(circle at top, rgba(0, 40, 90, 0.9), rgba(0, 0, 10, 0.98));"
            + "}"
            + ".elisa-msg-row {"
            + "  display: flex;"
            + "  margin-bottom: 6px;"
            + "}"
            + ".elisa-msg-row.elisa {"
            + "  justify-content: flex-start;"
            + "}"
            + ".elisa-msg-row.user {"
            + "  justify-content: flex-end;"
            + "}"
            + ".elisa-msg {"
            + "  max-width: 78%;"
            + "  padding: 7px 9px;"
            + "  border-radius: 12px;"
            + "  line-height: 1.4;"
            + "}"
            + ".elisa-msg.elisa {"
            + "  background: rgba(0, 150, 255, 0.85);"
            + "  color: #ffffff;"
            + "  border-bottom-left-radius: 2px;"
            + "}"
            + ".elisa-msg.user {"
            + "  background: rgba(255, 255, 255, 0.92);"
            + "  color: #001020;"
            + "  border-bottom-right-radius: 2px;"
            + "}"
            + ".elisa-typing {"
            + "  font-size: 11px;"
            + "  color: #cfe8ff;"
            + "  opacity: 0.85;"
            + "  margin-bottom: 4px;"
            + "}"
            + ".elisa-panel-input {"
            + "  border-top: 1px solid rgba(120, 200, 255, 0.5);"
            + "  padding: 6px 8px;"
            + "  background: rgba(0, 10, 40, 0.98);"
            + "  display: flex;"
            + "  gap: 6px;"
            + "}"
            + ".elisa-panel-input textarea {"
            + "  flex: 1 1 auto;"
            + "  resize: none;"
            + "  border-radius: 10px;"
            + "  border: 1px solid rgba(120, 200, 255, 0.6);"
            + "  padding: 6px 8px;"
            + "  font-size: 12px;"
            + "  background: rgba(0, 4, 20, 0.96);"
            + "  color: #e8f4ff;"
            + "  outline: none;"
            + "}"
            + ".elisa-panel-input button {"
            + "  flex-shrink: 0;"
            + "  border-radius: 999px;"
            + "  border: 1px solid rgba(140, 210, 255, 0.9);"
            + "  padding: 0 12px;"
            + "  font-size: 12px;"
            + "  background: linear-gradient(135deg, #00b4ff, #0075ff);"
            + "  color: #ffffff;"
            + "  cursor: pointer;"
            + "}"
            + ".elisa-panel-input button:disabled {"
            + "  opacity: 0.6;"
            + "  cursor: default;"
            + "}"
            + "@media (max-width: 640px) {"
            + "  .elisa-panel {"
            + "    right: 10px;"
            + "    left: 10px;"
            + "    width: auto;"
            + "  }"
            + "  .elisa-launcher {"
            + "    max-width: 210px;"
            + "  }"
            + "}";
        document.head.appendChild(style);

        // ---------- 3) Launcher button ----------
        var launcher = document.createElement("button");
        launcher.type = "button";
        launcher.className = "elisa-launcher";

        var avatarWrap = document.createElement("div");
        avatarWrap.className = "elisa-launcher-avatar";
        var avatarImg = document.createElement("img");
        avatarImg.src = "elisa.jpeg";
        avatarImg.alt = "Elisa";
        avatarWrap.appendChild(avatarImg);

        var textWrap = document.createElement("div");
        textWrap.className = "elisa-launcher-texts";
        var titleEl = document.createElement("div");
        titleEl.className = "elisa-launcher-title";
        titleEl.textContent = "Elisa";
        var subEl = document.createElement("div");
        subEl.className = "elisa-launcher-sub";
        subEl.textContent = "Your kind companion";
        textWrap.appendChild(titleEl);
        textWrap.appendChild(subEl);

        launcher.appendChild(avatarWrap);
        launcher.appendChild(textWrap);

        root.appendChild(launcher);

        // ---------- 4) Panel structure ----------
        var panel = document.createElement("div");
        panel.className = "elisa-panel";

        var header = document.createElement("div");
        header.className = "elisa-panel-header";

        var headerLeft = document.createElement("div");
        headerLeft.className = "elisa-panel-header-left";

        var headerAvatar = document.createElement("div");
        headerAvatar.className = "elisa-panel-header-avatar";
        var headerAvatarImg = document.createElement("img");
        headerAvatarImg.src = "elisa.jpeg";
        headerAvatarImg.alt = "Elisa";
        headerAvatar.appendChild(headerAvatarImg);

        var headerTexts = document.createElement("div");
        headerTexts.className = "elisa-panel-header-texts";
        var headerTitle = document.createElement("div");
        headerTitle.className = "elisa-panel-header-title";
        headerTitle.textContent = "Elisa";
        var headerSub = document.createElement("div");
        headerSub.className = "elisa-panel-header-sub";
        headerSub.textContent = "Warm, safe, non-diagnostic guidance";
        headerTexts.appendChild(headerTitle);
        headerTexts.appendChild(headerSub);

        headerLeft.appendChild(headerAvatar);
        headerLeft.appendChild(headerTexts);

        var closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "elisa-panel-close";
        closeBtn.innerHTML = "&times;";

        header.appendChild(headerLeft);
        header.appendChild(closeBtn);

        var messages = document.createElement("div");
        messages.className = "elisa-panel-messages";

        var inputWrap = document.createElement("div");
        inputWrap.className = "elisa-panel-input";

        var textarea = document.createElement("textarea");
        textarea.rows = 2;
        textarea.placeholder = "You can ask Elisa about your day, your health journey, or Elisence…";
        var sendBtn = document.createElement("button");
        sendBtn.type = "button";
        sendBtn.textContent = "Send";

        inputWrap.appendChild(textarea);
        inputWrap.appendChild(sendBtn);

        panel.appendChild(header);
        panel.appendChild(messages);
        panel.appendChild(inputWrap);

        root.appendChild(panel);

        // ---------- 5) Helpers ----------
        var isOpen = false;
        var typingEl = null;

        function openPanel() {
            if (!isOpen) {
                panel.style.display = "flex";
                isOpen = true;
                textarea.focus();
                if (messages.children.length === 0) {
                    addElisaMessage("Hi, I am Elisa. I cannot diagnose or replace a doctor, " +
                        "but I can help you think about your day, your health journey, and how Elisence works.");
                }
            }
        }

        function closePanel() {
            if (isOpen) {
                panel.style.display = "none";
                isOpen = false;
            }
        }

        function addRow(role, text) {
            var row = document.createElement("div");
            row.className = "elisa-msg-row " + role;

            var bubble = document.createElement("div");
            bubble.className = "elisa-msg " + role;
            bubble.textContent = text;

            row.appendChild(bubble);
            messages.appendChild(row);
            messages.scrollTop = messages.scrollHeight;
        }

        function addUserMessage(text) {
            addRow("user", text);
        }

        function addElisaMessage(text) {
            addRow("elisa", text);
        }

        function showTyping() {
            if (typingEl) return;
            typingEl = document.createElement("div");
            typingEl.className = "elisa-typing";
            typingEl.textContent = "Elisa is thinking…";
            messages.appendChild(typingEl);
            messages.scrollTop = messages.scrollHeight;
        }

        function hideTyping() {
            if (typingEl && typingEl.parentNode) {
                typingEl.parentNode.removeChild(typingEl);
            }
            typingEl = null;
        }

        function buildMockReply(userText) {
            var t = (userText || "").toLowerCase();

            if (t.indexOf("سلام") !== -1 || t.indexOf("salam") !== -1) {
                return "سلام، من الیسا هستم. نمی‌توانم تشخیص بدهم یا نسخه بدهم، " +
                    "ولی می‌توانیم با هم در مورد روزت، بدنت و برنامه سلامتت فکر کنیم.";
            }
            if (t.indexOf("stress") !== -1 || t.indexOf("استرس") !== -1) {
                return "استرس می‌تواند خیلی خسته‌کننده باشد. من تشخیص نمی‌دهم، " +
                    "اما معمولاً چند کار کوچک کمک می‌کند: نفس عمیق، یک قدم زدن کوتاه، " +
                    "و اگر ادامه داشت، صحبت با پزشک یا مشاور قابل اعتماد.";
            }
            if (t.indexOf("weight") !== -1 || t.indexOf("وزن") !== -1) {
                return "برای وزن، من قرار نیست جای دکتر باشم، " +
                    "اما می‌توانیم روی عادت‌های کوچک تمرکز کنیم: خواب کافی، آب، " +
                    "کمی حرکت روزانه و پیگیری با پزشک برای دارو و آزمایش‌ها.";
            }
            if (t.indexOf("elisence") !== -1 || t.indexOf("الیسنس") !== -1) {
                return "Elisence یک پلتفرم سلامت دیجیتال چند مرحله‌ای است که " +
                    "به خانواده‌ها، پزشکان و دولت‌ها کمک می‌کند داده‌ها را امن، قابل‌ردگیری " +
                    "و قابل‌اعتماد نگه دارند. این چت فقط یک نسخه نمایشیِ امن است.";
            }

            return "Thank you for sharing that with me. I cannot diagnose or give you a treatment plan, " +
                "but we can think step by step about your habits, your questions, and when it might be a good idea " +
                "to talk to a doctor or nurse in real life.";
        }

        function handleSend() {
            var text = textarea.value.trim();
            if (!text) {
                return;
            }
            textarea.value = "";
            addUserMessage(text);
            textarea.focus();

            sendBtn.disabled = true;
            textarea.disabled = true;
            showTyping();

            setTimeout(function () {
                var reply = buildMockReply(text);
                hideTyping();
                addElisaMessage(reply);
                sendBtn.disabled = false;
                textarea.disabled = false;
                textarea.focus();
            }, 900);
        }

        // ---------- 6) Events ----------
        launcher.addEventListener("click", function () {
            if (isOpen) {
                closePanel();
            } else {
                openPanel();
            }
        });

        closeBtn.addEventListener("click", function () {
            closePanel();
        });

        sendBtn.addEventListener("click", function () {
            handleSend();
        });

        textarea.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
                handleSend();
            }
        });
    });
})();
