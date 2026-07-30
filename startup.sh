#!/bin/bash
apt-get update
apt-get install -y ffmpeg
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app
