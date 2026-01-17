#!/usr/bin/env python3
import os
import sys
import time
import signal
import subprocess
import webbrowser
import threading
from pathlib import Path
from typing import List, Optional
from queue import Queue, Empty

# Configuration
BASE_DIR = Path(__file__).parent.resolve()
FRONTEND_DIR = BASE_DIR / 'frontend'
BACKEND_DIR = BASE_DIR / 'backend'

# ANSI color codes
COLORS = {
    'red': '\033[91m',
    'green': '\033[92m',
    'yellow': '\033[93m',
    'blue': '\033[94m',
    'magenta': '\033[95m',
    'cyan': '\033[96m',
    'white': '\033[97m',
    'end': '\033[0m'
}

class ProcessManager:
    def __init__(self):
        self.processes = []
        self.log_queue = Queue()
        self.running = True

    def log(self, message: str, source: str = "SYSTEM", color: str = 'white'):
        """Add a message to the log queue with color coding."""
        timestamp = time.strftime("%H:%M:%S")
        colored_source = f"{COLORS['cyan']}{source:10}{COLORS['end']}"
        colored_message = f"{COLORS[color]}{message}{COLORS['end']}"
        self.log_queue.put(f"[{timestamp}] {colored_source} | {colored_message}\n")

    def run_command(self, command: List[str], cwd: str = None, name: str = "CMD", color: str = 'white'):
        """Run a command and capture its output."""
        def enqueue_output(pipe, source):
            while self.running:
                line = pipe.readline()
                if line:
                    self.log(line.strip(), source, color)
                else:
                    time.sleep(0.1)

        try:
            process = subprocess.Popen(
                command,
                cwd=cwd or str(BASE_DIR),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True,
                shell=sys.platform == 'win32',
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
            )
            
            # Start threads to capture stdout and stderr
            threading.Thread(target=enqueue_output, args=(process.stdout, name), daemon=True).start()
            threading.Thread(target=enqueue_output, args=(process.stderr, f"{name}-ERR"), daemon=True).start()
            
            self.processes.append(process)
            return process
        except Exception as e:
            self.log(f"Failed to start {name}: {str(e)}", "ERROR", 'red')
            return None

    def start_backend(self):
        """Start the FastAPI backend server."""
        self.log("Starting backend server...", "BACKEND", 'blue')
        backend_env = os.environ.copy()
        backend_env['PYTHONPATH'] = str(BACKEND_DIR)
        
        return self.run_command(
            ['uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'],
            cwd=str(BACKEND_DIR),
            name="BACKEND",
            color='blue'
        )

    def start_frontend(self):
        """Start the Vite frontend development server."""
        self.log("Starting frontend server...", "FRONTEND", 'magenta')
        
        # Install dependencies if needed
        if not (FRONTEND_DIR / 'node_modules').exists():
            self.log("Installing frontend dependencies...", "FRONTEND", 'yellow')
            install = self.run_command(
                ['npm', 'install'],
                cwd=str(FRONTEND_DIR),
                name="NPM-INSTALL",
                color='yellow'
            )
            if install:
                install.wait()
        
        return self.run_command(
            ['npm', 'run', 'dev'],
            cwd=str(FRONTEND_DIR),
            name="FRONTEND",
            color='magenta'
        )

    def cleanup(self):
        """Cleanup all processes."""
        self.running = False
        self.log("Shutting down servers...", "SYSTEM", 'yellow')
        
        for process in self.processes:
            try:
                if sys.platform == 'win32':
                    process.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    process.terminate()
                process.wait(timeout=5)
            except (OSError, subprocess.TimeoutExpired):
                process.kill()
        
        self.log("All servers have been stopped.", "SYSTEM", 'green')

def main():
    manager = ProcessManager()
    
    def signal_handler(sig, frame):
        manager.cleanup()
        sys.exit(0)
    
    # Set up signal handling
    signal.signal(signal.SIGINT, signal_handler)
    if sys.platform != 'win32':
        signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start servers
        backend = manager.start_backend()
        time.sleep(2)  # Give backend a moment to start
        
        frontend = manager.start_frontend()
        
        # Open browser after a short delay
        def open_browser():
            time.sleep(5)  # Give servers time to start
            webbrowser.open('http://localhost:3000')
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Main logging loop
        while True:
            try:
                line = manager.log_queue.get_nowait()
                print(line, end='', flush=True)
            except Empty:
                time.sleep(0.1)
                continue
    
    except Exception as e:
        manager.log(f"Error: {str(e)}", "ERROR", 'red')
    finally:
        manager.cleanup()

if __name__ == "__main__":
    print(f"\n{COLORS['green']}🚀 Starting On Their Footsteps Application...{COLORS['end']}")
    print(f"{COLORS['blue']}🔵 Backend: http://localhost:8000{COLORS['end']}")
    print(f"{COLORS['magenta']}🟣 Frontend: http://localhost:3000{COLORS['end']}\n")
    main()