#!/usr/bin/env bash
# This script used to build all app images and push them to Docker Hub.
# Be sure in main branch!

BACKEND_IMAGE=basicai/x1-community-backend
FRONTEND_IMAGE=basicai/x1-community-frontend

cd ../backend && docker build -t $BACKEND_IMAGE . && docker push $BACKEND_IMAGE

cd ../frontend && docker build -t $FRONTEND_IMAGE . && docker push $FRONTEND_IMAGE
