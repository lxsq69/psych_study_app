#!/usr/bin/env python3
"""
Psychology 101 Desktop App Launcher
Starts a lightweight, zero-dependency localhost web server and launches the desktop browser.
"""

import http.server
import os
import signal
import socket
import socketserver
import subprocess
import sys
import threading
import time
import urllib.request
import webbrowser

# Determine application directory reliably
APP_DIR = os.path.dirname(os.path.realpath(__file__))
PORT_FILE = os.path.join(APP_DIR, ".server_port")
PID_FILE = os.path.join(APP_DIR, ".server_pid")

def is_server_running(port):
    """Check if our server is already answering on the recorded port."""
    try:
        url = f"http://127.0.0.1:{port}/index.html"
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=1) as resp:
            return resp.status == 200
    except Exception:
        return False

def find_free_port(start_port=8850):
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    # Fallback to ephemeral port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

class PsychRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with explicit MIME types and quiet logging."""
    
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".json": "application/json",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_DIR, **kwargs)

    def log_message(self, format, *args):
        # Quiet mode: suppress stdout clutter
        pass

def launch_browser(url):
    """Launch user browser with the app URL."""
    # Try Chrome/Chromium app mode first if available
    for browser_cmd in ["google-chrome", "chromium-browser", "chromium"]:
        if subprocess.run(["which", browser_cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
            try:
                subprocess.Popen([browser_cmd, f"--app={url}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return True
            except Exception:
                pass

    # Try Firefox with new window
    if subprocess.run(["which", "firefox"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
        try:
            subprocess.Popen(["firefox", "--new-window", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return True
        except Exception:
            pass

    # Fallback to xdg-open or python webbrowser
    if subprocess.run(["which", "xdg-open"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
        try:
            subprocess.Popen(["xdg-open", url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return True
        except Exception:
            pass

    webbrowser.open(url)
    return True

def main():
    os.chdir(APP_DIR)

    # Check if existing server instance is active
    if os.path.exists(PORT_FILE):
        try:
            with open(PORT_FILE, "r") as f:
                saved_port = int(f.read().strip())
            if is_server_running(saved_port):
                app_url = f"http://127.0.0.1:{saved_port}/index.html"
                print(f"Server already running at {app_url}. Opening browser...")
                launch_browser(app_url)
                return
        except Exception:
            pass

    # Start new server instance
    port = find_free_port()
    app_url = f"http://127.0.0.1:{port}/index.html"

    class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True
        daemon_threads = True

    server = ThreadedTCPServer(("127.0.0.1", port), PsychRequestHandler)

    # Save port and PID
    with open(PORT_FILE, "w") as f:
        f.write(str(port))
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    # Start background serving thread
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()

    print(f"Psychology 101 Study Suite running at {app_url}")
    launch_browser(app_url)

    # Clean shutdown on SIGINT/SIGTERM
    def cleanup(signum, frame):
        try:
            server.shutdown()
            server.server_close()
        except Exception:
            pass
        for path in [PORT_FILE, PID_FILE]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    # Keep server running
    try:
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        cleanup(None, None)

if __name__ == "__main__":
    main()
