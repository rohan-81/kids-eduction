"""
KidsZone One-Click Complete Database Setup Script
Run this script from anywhere in the project to automatically migrate and seed
all data into the Django SQLite database.
Usage:
    python setup_db.py
"""
import os
import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / 'backend'
SEED_SCRIPT = BACKEND_DIR / 'seed_complete_db.py'

# Find python executable (prefer venv python if available)
venv_python_win = BACKEND_DIR / 'venv' / 'Scripts' / 'python.exe'
venv_python_unix = BACKEND_DIR / 'venv' / 'bin' / 'python'

if venv_python_win.exists():
    PYTHON_EXEC = str(venv_python_win)
elif venv_python_unix.exists():
    PYTHON_EXEC = str(venv_python_unix)
else:
    PYTHON_EXEC = sys.executable

print(f"Using Python: {PYTHON_EXEC}")
print(f"Running database seed engine: {SEED_SCRIPT} ...\n")

res = subprocess.run([PYTHON_EXEC, str(SEED_SCRIPT)], cwd=str(BACKEND_DIR))
sys.exit(res.returncode)
