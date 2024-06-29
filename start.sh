#!/usr/bin/env bash

nohup python -m gunicorn -b :3939 api.main:app