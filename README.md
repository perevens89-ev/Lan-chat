LAN Chat — Offline Phone ↔ PC Communication
        
        A lightweight, offline chat and screenshot‑sharing app that works entirely over your local network (LAN).
        No internet required. No accounts. No cloud. Just your phone and computer talking directly.

Built with FastAPI, WebSockets, and a simple HTML/JS frontend.
Phone ↔ PC chat over LAN

Screenshot upload with automatic compression

Favorites system for saving important messages

Local message history stored in JSON

Works offline — only requires both devices on the same Wi‑Fi

Zero dependencies on external services

Simple, clean UI that works on any browser

The problem this solves for me, is that professionally and also in my private life, I take a lot of screenshots from manuals/tutorials and other pdfs on both my phone and computer (in a different room) as well copy/paste text which I'd like to send between my own phone and computer. I don't see why I need to send this across the internet by using cloud services or something else when both devices are within my own network, so why not chat and communicate within in my own LAN? Apps like Localsend do exist with the same functionality but why not code an app and maintain it yourself?

Requirements:
Python 3.10+
pip (Python package manager)

Running the Server
From inside the project folder:
python server.py

If successful, you’ll see:
Uvicorn running on http://0.0.0.0:8000

On your computer open in a web browser:
http://localhost:8000

On your phone
Make sure your phone is on the same Wi‑Fi as your computer

Find your computer’s LAN IP:

    ipconfig
    Look for something like:
        IPv4 Address . . . . . . . . . . : 192.168.1.50
    On your phone’s browser, open:
        http://YOUR_COMPUTER_IP:8000
    Example:
        http://192.168.1.50:8000
Now your phone and computer are connected offline.

Project Structure

    lan-chat/
    │
        ├── server.py
    │
        ├── data/
    │   ├── messages.json
    │   ├── collections.json
    │   └── screenshots/
    │
        └── static/
    ├── index.html
    ├── app.js
        └── style.css

How It Works
FastAPI serves the frontend and handles API routes

WebSockets provide real‑time chat

Screenshot uploads are compressed with Pillow

Messages are stored in JSON files inside data/

Favorites are tracked by message ID

Everything stays local — nothing leaves your network.

Important: Some routers block device‑to‑device traffic
If your phone cannot connect to the server even though the IP is correct:

    Your router may have AP Isolation / Client Isolation enabled
    Some ISP routers enforce this by default
    This prevents devices on Wi‑Fi from reaching each other

✔️ Workaround: 
Use a hotspot instead of your home router:

Option A — Phone hotspot

    Turn on hotspot on your phone
    Connect your PC to the hotspot
    Open the server normally
    Visit http://<PC-IP>:8000 on the phone

Option B — PC hotspot
   
    Turn on Windows Mobile Hotspot
    Connect your phone to it
    Visit: http://192.168.137.1:8000
    
This bypasses router isolation completely.
