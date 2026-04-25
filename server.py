print(">>> server.py is running")

import json
import time
from pathlib import Path
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import uvicorn

# -----------------------------
# Paths and folders
# -----------------------------
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
STATIC_DIR = BASE_DIR / "static"
SCREENSHOT_DIR = DATA_DIR / "screenshots"
MESSAGES_FILE = DATA_DIR / "messages.json"
COLLECTIONS_FILE = DATA_DIR / "collections.json"

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------
# FastAPI setup
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # LAN only, safe enough
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/screenshots", StaticFiles(directory=SCREENSHOT_DIR), name="screenshots")


# -----------------------------
# Helper functions
# -----------------------------
def load_json(path: Path) -> List[dict]:
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []


def save_json(path: Path, data: List[dict]):
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# -----------------------------
# WebSocket connection manager
# -----------------------------
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
async def root():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/history")
async def get_history():
    return load_json(MESSAGES_FILE)


@app.get("/api/favorites")
async def get_favorites():
    return load_json(COLLECTIONS_FILE)


@app.post("/api/favorite/{message_id}")
async def add_favorite(message_id: str):
    favorites


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)
