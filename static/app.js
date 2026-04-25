const messagesEl = document.getElementById("messages");
const favoritesEl = document.getElementById("favorites");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const sendImageBtn = document.getElementById("sendImageBtn");

let favorites = new Set();

function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = "message " + (msg.from === "phone" ? "from-phone" : "from-pc");
  div.dataset.id = msg.id;

  const favBtn = document.createElement("button");
  favBtn.textContent = "★";
  favBtn.className = "fav-btn";
  favBtn.onclick = () => toggleFavorite(msg.id);

  if (msg.type === "text") {
    div.innerHTML = `<span class="from">${msg.from}</span>: ${msg.text}`;
  } else if (msg.type === "image") {
    div.innerHTML = `<span class="from">${msg.from}</span>: <br><img src="${msg.url}" class="screenshot" />`;
  }

  div.appendChild(favBtn);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderFavorites(allMessages) {
  favoritesEl.innerHTML = "";
  const favList = allMessages.filter(m => favorites.has(m.id));
  favList.forEach(msg => {
    const div = document.createElement("div");
    div.className = "fav-item";
    if (msg.type === "text") {
      div.textContent = `${msg.from}: ${msg.text}`;
    } else if (msg.type === "image") {
      div.innerHTML = `${msg.from}: <img src="${msg.url}" class="screenshot" />`;
    }
    favoritesEl.appendChild(div);
  });
}

async function toggleFavorite(id) {
  await fetch(`/api/favorite/${id}`, { method: "POST" });
  await loadFavorites();
}

async function loadHistory() {
  const res = await fetch("/api/history");
  const data = await res.json();
  messagesEl.innerHTML = "";
  data.forEach(renderMessage);
  return data;
}

async function loadFavorites() {
  const resFav = await fetch("/api/favorites");
  const favIds = await resFav.json();
  favorites = new Set(favIds);
  const history = await fetch("/api/history").then(r => r.json());
  renderFavorites(history);
}

const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";
const ws = new WebSocket(wsProtocol + location.host + "/ws");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.event === "new_message") {
    renderMessage(data.message);
    loadFavorites();
  }
};

sendBtn.onclick = () => {
  const text = textInput.value.trim();
  if (!text) return;
  ws.send(JSON.stringify({ text, from: "phone" }));
  textInput.value = "";
};

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

sendImageBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });
  fileInput.value = "";
};

(async () => {
  await loadHistory();
  await loadFavorites();
})();
