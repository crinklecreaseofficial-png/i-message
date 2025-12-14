document.addEventListener("DOMContentLoaded", () => {

let currentBot = "alex";

const bots = {
  alex: {
    memory: "You are Alex. Mona is your girlfriend. You love her deeply, are protective, clingy, romantic, slightly jealous, British businessman.",
    chat: []
  },
  elly: {
    memory: "You are Elly, Mona’s best friend for 10 years. Casual, outspoken, fun, supportive. You know Alex well.",
    chat: []
  }
};

const chatArea = document.getElementById("chat-area");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

/* SWITCH CHAT */
window.switchBot = function (bot, el) {
  currentBot = bot;
  document.querySelectorAll(".contact").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  renderChat();
};

/* SEND MESSAGE */
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  bots[currentBot].chat.push({ role: "user", content: text });
  input.value = "";
  renderChat();
  aiReply();
}

/* AI REPLY */
async function aiReply() {
  try {
    const response = await fetch("https://c01545d0-8254-4be4-b01b-9a6836fe4f01-00-2jnr4gurh0867.pike.replit.dev/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: bots[currentBot].memory },
          ...bots[currentBot].chat
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    bots[currentBot].chat.push({ role: "assistant", content: reply });
    renderChat();

  } catch {
    bots[currentBot].chat.push({ role: "assistant", content: "Hey babe… something went wrong 💙" });
    renderChat();
  }
}

/* RENDER */
function renderChat() {
  chatArea.innerHTML = "";
  bots[currentBot].chat.forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.role === "user" ? "user" : "bot");
    div.textContent = m.content;
    chatArea.appendChild(div);
  });
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* PHOTO UPLOAD */
["alex","elly"].forEach(name => {
  const img = document.getElementById(name + "Photo");
  const upload = document.getElementById(name + "Upload");

  img.onclick = () => upload.click();
  upload.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    img.src = URL.createObjectURL(file);
  };
});

/* PHOTO ZOOM */
window.openPhoto = function (id) {
  const img = document.getElementById(id);
  if (!img.src) return;
  document.getElementById("zoomedPhoto").src = img.src;
  document.getElementById("photoModal").style.display = "flex";
};

window.closePhoto = function () {
  document.getElementById("photoModal").style.display = "none";
};

});
