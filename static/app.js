window.onerror = function(msg, url, line, col, error) {
    alert("JS ERROR: " + msg + " @ " + line + ":" + col);
};

const messagesEl = document.getElementById("messages");
const favoritesEl = document.getElementById("favorites");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const sendImageBtn = document.getElementById("sendImageBtn");

let favorites = new Set();

/* -----------------------------
   IDENTIFY DEVICE (PC vs PHONE)
----------------------------- */
const CLIENT_FROM = /Android|iPhone|Mobile/i.test(navigator.userAgent)
  ? "phone"
  : "pc";

/* -----------------------------
   UUID (works on all browsers)
----------------------------- */
function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/* -----------------------------
   RENDER MESSAGE
----------------------------- */
function renderMessage(msg) {
  msg.type = msg.type || "text";
  msg.id = msg.id || uuid();
  msg.from = msg.from || CLIENT_FROM;

  const div = document.createElement("div");
  div.className = "message " + (msg.from === "phone" ? "from-phone" : "from-pc");
  div.dataset.id = msg.id;

  const favBtn = document.createElement("button");
  favBtn.textContent = "★";
  favBtn.className = "fav-btn";
  favBtn.onclick = () => toggleFavorite(msg.id);

  if (msg.type === "text") {
    div.innerHTML = `<span class="from">${msg.from}</span>${msg.text}`;
  } else if (msg.type === "image") {
    div.innerHTML = `<span class="from">${msg.from}</span><br><img src="${msg.url}" class="screenshot" />`;
  }

  div.appendChild(favBtn);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* -----------------------------
   FAVORITES
----------------------------- */
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

/* -----------------------------
   HISTORY + FAVORITES
----------------------------- */
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

/* -----------------------------
   WEBSOCKET
----------------------------- */
console.log("About to open WS");

const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";
console.log("WS protocol:", wsProtocol);
console.log("WS host:", location.host);

const ws = new WebSocket(wsProtocol + location.host + "/ws");

ws.onopen = () => console.log("WS OPEN");
ws.onerror = (e) => console.log("WS ERROR", e);
ws.onclose = () => console.log("WS CLOSED");

ws.onmessage = (event) => {
    console.log("WS MESSAGE", event.data);
    const msg = JSON.parse(event.data);
    renderMessage(msg);
    loadFavorites();
};

/* -----------------------------
   SEND TEXT
----------------------------- */
sendBtn.onclick = () => {
  const text = textInput.value.trim();
  if (!text) return;

  ws.send(JSON.stringify({
    id: uuid(),
    type: "text",
    text,
    from: CLIENT_FROM
  }));

  textInput.value = "";
};

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

/* -----------------------------
   SEND IMAGE  (FIXED)
----------------------------- */
sendImageBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  // Upload to server
  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();   // { url: "..." }

  // Notify the other device via WebSocket
  ws.send(JSON.stringify({
    id: uuid(),
    type: "image",
    url: data.url,
    from: CLIENT_FROM
  }));

  fileInput.value = "";
};

/* -----------------------------
   INIT
----------------------------- */
(async () => {
  await loadHistory();
  await loadFavorites();
})();
