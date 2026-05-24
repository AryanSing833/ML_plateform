#!/bin/bash
# Deployment script for AWS ec2-s3

set -e

echo "Starting deployment to AWS ec2-s3..."

# Provider-specific deployment commands

# AWS EC2 + S3 deployment
aws s3 mb s3://${PROJECT_NAME}-artifacts || echo "Bucket exists"
./deploy.sh


echo "Deployment completed successfully!"
echo "Your application is now live!"
