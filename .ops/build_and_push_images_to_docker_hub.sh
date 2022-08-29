#!/usr/bin/env bash
# This script used to build all app images of X1 community, and push them to Docker Hub.
# Be sure in main branch!

BACKEND_IMAGE=basicai/x1-community-backend
FRONTEND_IMAGE=basicai/x1-community-frontend
IMAGE_OBJECT_DETECTION_IMAGE=basicai/x1-community-image-object-detection

cd ../backend && docker build -t $BACKEND_IMAGE . && docker push $BACKEND_IMAGE

cd ../frontend && docker build -t $FRONTEND_IMAGE . && docker push $FRONTEND_IMAGE

cd ../model/image-object-detection && docker build -t $IMAGE_OBJECT_DETECTION_IMAGE . && docker push $IMAGE_OBJECT_DETECTION_IMAGE
