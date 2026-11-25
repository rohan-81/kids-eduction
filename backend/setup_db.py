"""
KidsZone One-Click Complete Database Setup Script (inside backend)
Usage:
    python setup_db.py
"""
import os
import sys
import subprocess
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.append(str(BACKEND_DIR))

# Auto-detect venv if running with global python without django
try:
    import django
except ImportError:
    win_venv = BACKEND_DIR / 'venv' / 'Scripts' / 'python.exe'
    unix_venv = BACKEND_DIR / 'venv' / 'bin' / 'python'
    target_py = win_venv if win_venv.exists() else unix_venv if unix_venv.exists() else None
    if target_py and sys.executable.lower() != str(target_py).lower():
        res = subprocess.run([str(target_py)] + sys.argv, cwd=str(BACKEND_DIR))
        sys.exit(res.returncode)
    raise

# Import and run seed engine directly
from seed_complete_db import run_seed

if __name__ == '__main__':
    run_seed()
