document.addEventListener("DOMContentLoaded", () => {
  const BACKEND =
    "https://c01545d0-8254-4be4-b01b-9a6836fe4f01-00-2jnr4gurh0867.pike.replit.dev/chat";

  const chat = document.getElementById("chat-area");
  const input = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");

  let activeBot = localStorage.getItem("activeBot") || "alex";

  const defaultBots = {
    alex: {
      history: [
        {
          role: "system",
          content:
            "You are Alex, Mona’s British boyfriend. You are a businessman. You and Mona have been together for over two years. You are affectionate, clingy, slightly possessive, emotionally intelligent, and realistic. You NEVER repeat phrases. Respond naturally and directly.",
        },
      ],
    },
    elly: {
      history: [
        {
          role: "system",
          content:
            "You are Elly, Mona’s best friend of 10 years. You are American, living in Australia with your boyfriend Leon. You know everything about Mona’s life and her relationship with Alex. You are outspoken, funny, casual, and supportive. You NEVER repeat phrases.",
        },
      ],
    },
  };

  let bots = JSON.parse(localStorage.getItem("bots")) || defaultBots;

  function saveState() {
    localStorage.setItem("bots", JSON.stringify(bots));
    localStorage.setItem("activeBot", activeBot);
  }

  function renderChat() {
    chat.innerHTML = "";
    bots[activeBot].history.forEach((m) => {
      if (m.role === "user") addMessage(m.content, "user");
      if (m.role === "assistant") addMessage(m.content, "bot");
    });
  }

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement("div");
    t.id = "typing";
    t.className = "typing";
    t.textContent = "typing…";
    chat.appendChild(t);
  }

  function removeTyping() {
    const t = document.getElementById("typing");
    if (t) t.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const bot = bots[activeBot];
    bot.history.push({ role: "user", content: text });
    saveState();

    showTyping();

    try {
      const res = await fetch(BACKEND, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: bot.history,
          temperature: 0.7,
          frequency_penalty: 0.8,
          presence_penalty: 0.6,
        }),
      });

      const data = await res.json();
      removeTyping();

      if (!data.reply) return;

      const last = bot.history
        .slice()
        .reverse()
        .find((m) => m.role === "assistant")?.content;

      if (last === data.reply) return;

      bot.history.push({ role: "assistant", content: data.reply });
      addMessage(data.reply, "bot");
      saveState();
    } catch {
      removeTyping();
    }
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  window.switchBot = (name, el) => {
    activeBot = name;
    saveState();
    document
      .querySelectorAll(".contact")
      .forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
    renderChat();
  };

  window.triggerUpload = (id) => {
    document.getElementById(id).click();
  };

  document.getElementById("alexUpload").onchange = (e) =>
    setPhoto(e, "alexPhoto");
  document.getElementById("ellyUpload").onchange = (e) =>
    setPhoto(e, "ellyPhoto");

  function setPhoto(e, imgId) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      (document.getElementById(imgId).src = reader.result);
    reader.readAsDataURL(file);
  }

  renderChat();
});
