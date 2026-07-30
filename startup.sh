#!/bin/bash
apt-get update && apt-get install -y ffmpeg
pip install -r requirements.txt
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
