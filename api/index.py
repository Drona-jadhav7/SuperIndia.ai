import os
import sys

# Ensure repository root is on sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.main import app

# Vercel Serverless Function entrypoint
# The ASGI application 'app' is automatically handled by Vercel's Python runtime.
